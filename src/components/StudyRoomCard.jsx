import { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudyRoomCard({ room, onJoin }) {
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const count = room.participantCount || 0;
  const isFull = count >= room.maxParticipants;

  const handleJoinClick = async () => {
    setJoining(true);
    const result = await onJoin(room);
    if (result?.success) {
      navigate(`/study-room/${room.id}`);
    } else {
      setJoining(false);
    }
  };

  return (
    <div className="roomrow">
      <div>
        <h3>{room.name}</h3>
        <p className="muted small">Hosted by {room.creatorName}</p>
      </div>

      <div className="r-sub">
        <div>{room.subject}</div>
        <div className="muted small">{room.topic}</div>
      </div>

      <div
        className={`seats${isFull ? " full" : ""}`}
        role="img"
        aria-label={`${count} of ${room.maxParticipants} seats taken`}
      >
        {Array.from({ length: room.maxParticipants }, (_, i) => (
          <b key={i} className={i < count ? "f" : ""} />
        ))}
      </div>

      {isFull ? (
        <button className="btn btn-alt btn-sm" disabled>
          Room full
        </button>
      ) : (
        <button className="btn btn-sm" onClick={handleJoinClick} disabled={joining}>
          {joining ? "Joining..." : "Join →"}
        </button>
      )}
    </div>
  );
}

export default StudyRoomCard;
