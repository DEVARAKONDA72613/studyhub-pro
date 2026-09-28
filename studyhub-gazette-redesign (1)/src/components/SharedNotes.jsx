import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToNotes, saveNotes } from "../utils/firestoreNotes";
import { showNotification } from "../utils/notifications";

function timeAgo(ts) {
  if (!ts) return null;
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function SharedNotes({ roomId, roomName }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [meta, setMeta] = useState({ updatedAt: null, updatedByName: null });
  const [saveState, setSaveState] = useState("idle");

  const isFocusedRef = useRef(false);
  const debounceRef = useRef(null);
  const initializedRef = useRef(false);
  const lastUpdatedAtRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToNotes(roomId, (data) => {
      // Never overwrite text the person is actively typing.
      if (isFocusedRef.current) return;

      const updatedAtMs = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : null;

      if (!initializedRef.current) {
        initializedRef.current = true;
        lastUpdatedAtRef.current = updatedAtMs;
      } else if (
        updatedAtMs &&
        updatedAtMs !== lastUpdatedAtRef.current &&
        data.updatedByName &&
        data.updatedByName !== user?.displayName
      ) {
        lastUpdatedAtRef.current = updatedAtMs;
        showNotification(`Notes updated in ${roomName || "your study room"}`, {
          body: `${data.updatedByName} updated the shared notes.`,
          icon: "/logo.png",
          tag: `notes-${roomId}`,
        });
      } else {
        lastUpdatedAtRef.current = updatedAtMs;
      }

      setContent(data.content || "");
      setMeta({ updatedAt: data.updatedAt, updatedByName: data.updatedByName });
    });

    return () => unsubscribe();
  }, [roomId, roomName, user]);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    setSaveState("saving");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!user) return;
      try {
        await saveNotes(roomId, user, value);
        setSaveState("saved");
      } catch (err) {
        console.error(err);
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <section className="panel" aria-label="Shared notes">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h2 className="panel-h">Shared notes — one page, everyone in the room</h2>
        <span className="muted mono small" role="status" aria-live="polite">
          {saveState === "saving" && "Saving..."}
          {saveState === "saved" && "Saved"}
          {saveState === "idle" &&
            meta.updatedByName &&
            `Last edited by ${meta.updatedByName} · ${timeAgo(meta.updatedAt)}`}
        </span>
      </div>

      <textarea
        className="input notes-area"
        value={content}
        onChange={handleChange}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        aria-label="Shared study notes, visible and editable by everyone in this room"
        placeholder="Start typing shared study notes... everyone in this room can see and edit them."
      />
    </section>
  );
}

export default SharedNotes;
