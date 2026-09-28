import { useState } from "react";

function RoomVideoCall({ roomId }) {
  const [callActive, setCallActive] = useState(false);

  const jitsiUrl = `https://meet.jit.si/StudyHubPro-${roomId}#config.prejoinPageEnabled=false`;

  return (
    <section className="panel" aria-label="Voice and video call">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: callActive ? 14 : 0 }}>
        <h2 className="panel-h" style={{ margin: 0 }}>
          Voice &amp; video call
        </h2>

        {callActive ? (
          <button className="btn btn-danger btn-sm" onClick={() => setCallActive(false)}>
            Leave call
          </button>
        ) : (
          <button className="btn btn-sm" onClick={() => setCallActive(true)}>
            Start call
          </button>
        )}
      </div>

      {!callActive && (
        <p className="muted small" style={{ marginTop: 10 }}>
          Free video and voice for everyone in this room, powered by Jitsi Meet. Nothing starts
          until you click "Start call" — your camera and mic stay off until then.
        </p>
      )}

      {callActive && (
        <iframe
          className="jitsi"
          src={jitsiUrl}
          title="Video call"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
        />
      )}
    </section>
  );
}

export default RoomVideoCall;
