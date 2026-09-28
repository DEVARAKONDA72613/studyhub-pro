import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "../context/AuthContext";
import { getAIMessages, appendAIMessage } from "../utils/aiAssistantStore";
import { requestAIResponse } from "../utils/aiClient";

const MAX_PROMPT_LENGTH = 800;
const SEND_COOLDOWN_MS = 1500;

const QUICK_ACTIONS = [
  { id: "explain", label: "Explain", autoSend: true, buildPrompt: (c) => `Explain ${c.topic} in simple, easy to understand language.` },
  { id: "solve", label: "Solve", autoSend: false, buildPrompt: () => "Help me solve this problem step by step: " },
  { id: "hint", label: "Hint", autoSend: false, buildPrompt: () => "Give me a hint, not the full answer, for: " },
  { id: "quiz", label: "Quiz me", autoSend: true, buildPrompt: (c) => `Generate a short quiz to test my understanding of ${c.topic}.` },
  { id: "summarize", label: "Summarize", autoSend: false, buildPrompt: () => "Summarize this: " },
  { id: "debug", label: "Debug", autoSend: false, buildPrompt: () => "Help me understand this error: " },
];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AIAssistantPanel({ roomId, context }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeAction, setActiveAction] = useState(null);

  const listRef = useRef(null);
  const lastSendRef = useRef(0);

  useEffect(() => {
    if (!user) return;
    setMessages(getAIMessages(roomId, user.uid));
  }, [roomId, user]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const sendPrompt = async (rawPrompt, actionId) => {
    const prompt = rawPrompt.trim();

    if (!prompt) {
      setError("Please enter a question before sending.");
      return;
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      setError(`Message is too long (max ${MAX_PROMPT_LENGTH} characters).`);
      return;
    }
    if (Date.now() - lastSendRef.current < SEND_COOLDOWN_MS) {
      setError("Please wait a moment before sending another message.");
      return;
    }
    if (!user) return;

    lastSendRef.current = Date.now();
    setError("");
    setLoading(true);
    setText("");
    setActiveAction(null);

    setMessages(
      appendAIMessage(roomId, user.uid, {
        id: "u-" + Date.now(),
        role: "user",
        text: prompt,
        createdAt: Date.now(),
      })
    );

    try {
      const response = await requestAIResponse({ prompt, action: actionId, context });
      setMessages(
        appendAIMessage(roomId, user.uid, {
          id: "a-" + Date.now(),
          role: "assistant",
          text: response.text,
          createdAt: Date.now(),
        })
      );
    } catch {
      setError("The AI assistant couldn't respond right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setError("");
    const prompt = action.buildPrompt(context);
    if (action.autoSend) {
      sendPrompt(prompt, action.id);
    } else {
      setText(prompt);
      setActiveAction(action.id);
    }
  };

  return (
    <section className="panel" aria-label="AI study assistant">
      <h2 className="panel-h">AI study assistant</h2>
      <p className="muted small" style={{ marginBottom: 14 }}>
        Knows this room is studying {context.subject} → {context.topic}
      </p>

      <div className="qa">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            className="chip"
            aria-pressed={activeAction === action.id}
            disabled={loading}
            onClick={() => handleQuickAction(action)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div ref={listRef} className="msgs msg-scroll" role="log" aria-live="polite" aria-label="AI conversation">
        {messages.length === 0 && (
          <p className="muted small" style={{ textAlign: "center", marginTop: 40 }}>
            Stuck on something? Ask a question or use a quick action above.
          </p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`m ${msg.role === "user" ? "me" : "ai"}`}>
            <b>
              {msg.role === "user" ? "You" : "AI assistant"} · {formatTime(msg.createdAt)}
            </b>
            {msg.role === "assistant" ? (
              <div className="md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            ) : (
              msg.text
            )}
          </div>
        ))}

        {loading && <p className="muted mono small">AI is thinking...</p>}
      </div>

      {error && <p className="err">{error}</p>}

      <form
        className="cf"
        onSubmit={(e) => {
          e.preventDefault();
          sendPrompt(text, activeAction);
        }}
      >
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask the AI assistant anything..."
          aria-label="Ask the AI assistant"
          maxLength={MAX_PROMPT_LENGTH}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !text.trim()}>
          Ask
        </button>
      </form>
    </section>
  );
}

export default AIAssistantPanel;
