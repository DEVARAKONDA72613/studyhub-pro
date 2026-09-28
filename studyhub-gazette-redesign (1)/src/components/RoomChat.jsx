import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToMessages, sendMessage } from "../utils/firestoreChat";
import { showNotification } from "../utils/notifications";

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function RoomChat({ roomId, roomName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const seenIds = new Set();
    let initialized = false;

    const unsubscribe = subscribeToMessages(roomId, (incoming) => {
      if (!initialized) {
        incoming.forEach((m) => seenIds.add(m.id));
        initialized = true;
      } else {
        incoming.forEach((m) => {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            if (m.userId !== user?.uid) {
              showNotification(`${m.userName} in ${roomName || "your study room"}`, {
                body: m.message,
                icon: "/logo.png",
                tag: `chat-${roomId}`,
              });
            }
          }
        });
      }
      setMessages(incoming);
    });

    return () => unsubscribe();
  }, [roomId, roomName, user]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    const toSend = text;
    setText("");

    try {
      await sendMessage(roomId, user, toSend);
    } catch (err) {
      console.error(err);
      setText(toSend);
    }
  };

  return (
    <section className="cell" aria-label="Room chat">
      <h2 className="panel-h">Room chat</h2>

      <div ref={listRef} className="msgs" role="log" aria-live="polite" aria-label="Room chat messages">
        {messages.length === 0 && (
          <p className="muted small" style={{ textAlign: "center", marginTop: 40 }}>
            No messages yet. Say hello to the room.
          </p>
        )}

        {messages.map((msg) => {
          const isSelf = msg.userId === user?.uid;
          return (
            <div key={msg.id} className={`m${isSelf ? " me" : ""}`}>
              <b>
                {isSelf ? "You" : msg.userName} · {formatTime(msg.createdAt)}
              </b>
              {msg.message}
            </div>
          );
        })}
      </div>

      <form className="cf" onSubmit={handleSend}>
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message"
          aria-label="Message"
          maxLength={1000}
        />
        <button type="submit" disabled={!text.trim()} aria-label="Send message">
          Send
        </button>
      </form>
    </section>
  );
}

export default RoomChat;
