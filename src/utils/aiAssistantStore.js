const KEY_PREFIX = "shp_ai_chat_";

function storageKey(roomId, userId) {
  return KEY_PREFIX + roomId + "_" + userId;
}

export function getAIMessages(roomId, userId) {
  try {
    const raw = localStorage.getItem(storageKey(roomId, userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendAIMessage(roomId, userId, message) {
  const messages = getAIMessages(roomId, userId);
  messages.push(message);
  const trimmed = messages.slice(-100);
  localStorage.setItem(storageKey(roomId, userId), JSON.stringify(trimmed));
  return trimmed;
}

export function clearAIMessages(roomId, userId) {
  localStorage.removeItem(storageKey(roomId, userId));
  return [];
}