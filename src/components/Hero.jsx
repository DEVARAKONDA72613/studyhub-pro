import { Link } from "react-router-dom";

function Hero({ rooms, user }) {
  const featured = [...rooms]
    .filter((r) => (r.participantCount || 0) > 0 && r.participantCount < r.maxParticipants)
    .sort((a, b) => b.participantCount - a.participantCount)[0];

  const seats = (room) =>
    Array.from({ length: room.maxParticipants }, (_, i) => (
      <b key={i} className={i < room.participantCount ? "f" : ""} />
    ));

  return (
    <section className="hero">
      <div>
        {user && (
          <p className="welcome mono">Welcome back, {user.displayName?.split(" ")[0]}.</p>
        )}
        <h1 className="hd">
          Study <span className="hl">together</span>, quietly.
        </h1>
        <p className="sub">
          Notes for every subject, and small rooms of up to five where everyone stays on task —
          with a timer, a shared page of notes, and an AI tutor when you get stuck.
        </p>
        <div className="btnrow">
          <Link to="/study-rooms" className="btn">
            Find a room
          </Link>
          <Link to="/library" className="btn btn-alt">
            Browse the library
          </Link>
        </div>
      </div>

      <aside className="ticket" aria-label="Featured room">
        {featured ? (
          <>
            <span className="stamp mono">IN SESSION</span>
            <div className="mono muted small">Room № {featured.id.slice(0, 4).toUpperCase()}</div>
            <h3>{featured.name}</h3>
            <div className="muted small" style={{ marginTop: 2 }}>
              {featured.subject} · {featured.topic}
            </div>
            <div className="dash" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="seats">{seats(featured)}</div>
              <Link to="/study-rooms" className="mono small" style={{ textDecoration: "underline" }}>
                Take a seat →
              </Link>
            </div>
          </>
        ) : (
          <>
            <span className="stamp mono">OPEN</span>
            <div className="mono muted small">Room № —</div>
            <h3>No room in session</h3>
            <div className="muted small" style={{ marginTop: 2 }}>
              Be the first to open one.
            </div>
            <div className="dash" />
            <Link to="/study-rooms/create" className="mono small" style={{ textDecoration: "underline" }}>
              Start a room →
            </Link>
          </>
        )}
      </aside>
    </section>
  );
}

export default Hero;
