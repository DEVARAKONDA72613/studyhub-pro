export async function requestAIResponse({ prompt, action, context }) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, action, context }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Unexpected response from the AI assistant.");
  }

  if (!response.ok) {
    throw new Error(data.error || "The AI assistant couldn't respond right now.");
  }

  return { text: data.text };
}