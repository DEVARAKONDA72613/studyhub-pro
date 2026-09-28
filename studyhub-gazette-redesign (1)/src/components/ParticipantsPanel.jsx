import { useEffect, useState } from "react";

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function ParticipantsPanel({
  participants,
  maxParticipants,
  currentUserId,
  onToggleStudying,
  isOwner,
  onRemove,
}) {
  const [now, setNow] = useState(Date.now());
  const hasRunningTimer = participants.some((p) => p.timerState?.running);

  useEffect(() => {
    if (!hasRunningTimer) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasRunningTimer]);

  return (
    <section className="cell" aria-label="Participants">
      <h2 className="panel-h">
        Seated · {participants.length} of {maxParticipants}
      </h2>

      {participants.map((p) => {
        const isSelf = p.id === currentUserId;
        const timerState = p.timerState;
        const remaining = timerState?.running ? timerState.endsAt - now : null;
        const sessionLabel =
          timerState?.running && remaining > 0
            ? `${timerState.mode === "focus" ? "Focus" : "Break"} · ${formatRemaining(remaining)}`
            : null;

        return (
          <div key={p.id} className="ppl-row">
            <div className="ppl-name">
              <i className="dot" aria-hidden="true" title="Online" />
              <span style={{ minWidth: 0 }}>
                <b>{p.name}</b>
                {isSelf && <span className="muted"> (you)</span>}
                {p.isCreator && <span className="muted mono small"> · host</span>}
                {sessionLabel ? (
                  <span className="live" role="status" style={{ display: "block" }}>
                    ● {sessionLabel}
                  </span>
                ) : p.studying ? (
                  <span className="muted mono small" style={{ display: "block" }}>
                    studying
                  </span>
                ) : null}
              </span>
            </div>

            <span style={{ display: "flex", gap: 6, flex: "none" }}>
              {isSelf && !timerState?.running && (
                <button
                  className="chip"
                  onClick={() => onToggleStudying(!p.studying)}
                  aria-pressed={!!p.studying}
                >
                  {p.studying ? "Studying ✓" : "Mark studying"}
                </button>
              )}

              {isOwner && !isSelf && !p.isCreator && (
                <button
                  className="chip"
                  onClick={() => onRemove(p.id, p.name)}
                  aria-label={`Remove ${p.name} from the room`}
                  style={{ color: "var(--sig)", borderColor: "var(--sig)" }}
                >
                  Remove
                </button>
              )}
            </span>
          </div>
        );
      })}
    </section>
  );
}

export default ParticipantsPanel;
