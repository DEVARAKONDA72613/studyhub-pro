function RoomTicker({ rooms, user }) {
  const live = rooms.filter((r) => (r.participantCount || 0) > 0);

  const items = live.length
    ? live.map((r) => `${r.name} — ${r.participantCount}/${r.maxParticipants} seated`)
    : [
        "Rooms of up to five students",
        "Shared timer, shared notes, live chat",
        "A free AI study assistant in every room",
        user ? "Nobody is studying right now — start a room" : "Sign in to see rooms in session",
      ];

  const line = items.map((t, i) => <span key={i}>● {t}</span>);

  return (
    <div className="tick mono" aria-label="Rooms currently in session">
      <span className="tick-lab">{live.length ? "IN SESSION" : "STUDYHUB"}</span>
      <div className="track">
        <div style={{ display: "flex" }}>{line}</div>
        <div style={{ display: "flex" }} aria-hidden="true">
          {line}
        </div>
      </div>
    </div>
  );
}

export default RoomTicker;
