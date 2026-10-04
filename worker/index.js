const MAX_PROMPT_LENGTH = 800;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;

// In-memory per-isolate map: a soft guard against accidental bursts from one
// client, not a hard security boundary (isolates recycle, so this resets).
// A durable, per-user limit via Cloudflare KV or Durable Objects is a good
// addition alongside the real database in Phase 9.
const requestLog = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

const ACTION_INSTRUCTIONS = {
  explain: "Explain the concept clearly and simply, as if teaching a student encountering it for the first time.",
  solve: "Help solve the problem step by step, showing your reasoning at each step.",
  hint: "Give only a hint that nudges the student toward the answer. Do not reveal the full solution.",
  quiz: "Generate a short quiz (3-5 questions) to test understanding of the topic. Include an answer key at the end.",
  summarize: "Summarize the provided content clearly and concisely.",
  debug: "Help the student understand the error and how to fix it, explaining the underlying cause.",
};

function buildSystemPrompt(context) {
  const room = context || {};
  return (
    "You are the AI Study Assistant inside StudyHub Pro, a study platform. " +
    "You are helping a student in a virtual study room" +
    (room.roomName ? ` called "${room.roomName}"` : "") +
    (room.subject ? `, focused on the subject "${room.subject}"` : "") +
    (room.topic ? ` and specifically the topic "${room.topic}"` : "") +
    ". Use this context to interpret the student's question even if they don't restate it. " +
    "Stay strictly focused on education and studying. Keep answers clear, encouraging, and appropriately concise for a chat panel.\n\n" +
    "Formatting rules: write like a knowledgeable tutor chatting with a student, not a reference manual. " +
    "Default to short paragraphs and markdown bullet/numbered lists for structure. Use **bold** sparingly, " +
    "only for genuinely key terms. Only use a markdown table when the content is truly tabular (e.g. comparing " +
    "2-4 short items on 2-3 attributes) — never as the default format for an explanation. Never put raw HTML " +
    "tags like <br> inside your response; use plain markdown line breaks (a blank line) instead. Keep table " +
    "cells to a few words, not full sentences."
  );
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function callGroq(env, systemPrompt, prompt) {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      // Free-tier model on Groq. Check console.groq.com/docs/models if this is deprecated.
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "No response generated.";
}

async function handleAIRequest(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const { prompt, action, context } = body || {};

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return jsonResponse({ error: "Prompt cannot be empty." }, 400);
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonResponse({ error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters).` }, 400);
  }
  const rateLimitKey = request.headers.get("CF-Connecting-IP") || "unknown";
  if (isRateLimited(rateLimitKey)) {
    return jsonResponse({ error: "Too many requests. Please slow down and try again shortly." }, 429);
  }

  const systemPrompt = buildSystemPrompt(context);
  const actionInstruction = action && ACTION_INSTRUCTIONS[action] ? ACTION_INSTRUCTIONS[action] : null;
  const fullSystemPrompt = actionInstruction ? `${systemPrompt}\n\n${actionInstruction}` : systemPrompt;

  try {
    const text = await callGroq(env, fullSystemPrompt, prompt);

    return jsonResponse({ text });
  } catch (error) {
    console.error("AI provider error:", error.message);
    return jsonResponse(
      { error: "The AI assistant is temporarily unavailable. Please try again." },
      502
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ai") {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
      }
      return handleAIRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};