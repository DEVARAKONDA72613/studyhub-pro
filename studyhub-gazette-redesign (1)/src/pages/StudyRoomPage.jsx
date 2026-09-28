import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ParticipantsPanel from "../components/ParticipantsPanel";
import RoomChat from "../components/RoomChat";
import StudyTimer from "../components/StudyTimer";
import SharedNotes from "../components/SharedNotes";
import AIAssistantPanel from "../components/AIAssistantPanel";
import NotificationPrompt from "../components/NotificationPrompt";
import RoomVideoCall from "../components/RoomVideoCall";
import { useAuth } from "../context/AuthContext";
import {
  joinRoom,
  leaveRoom,
  deleteRoom,
  setStudyingStatus,
  subscribeToRoom,
  subscribeToParticipants,
  sendHeartbeat,
  cleanupStaleParticipants,
} from "../utils/firestoreRooms";

function Notice({ title, children }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="wrap page">
        <div className="empty" style={{ marginTop: 40 }}>
          <h3>{title}</h3>
          {children && <p>{children}</p>}
        </div>
      </main>
    </>
  );
}

function StudyRoomPage() {
  const { roomId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [status, setStatus] = useState("joining");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const joinedOnceRef = useRef(false);

  useEffect(() => {
    if (loading || !user) return;

    let unsubRoom = () => {};
    let unsubParticipants = () => {};
    let cancelled = false;
    joinedOnceRef.current = false;

    joinRoom(roomId, user)
      .then(() => {
        if (cancelled) return;
        setStatus("ready");
        unsubRoom = subscribeToRoom(roomId, (data) => {
          if (!data) {
            setStatus("not-found");
            return;
          }
          setRoom(data);
        });
        unsubParticipants = subscribeToParticipants(roomId, (list) => {
          setParticipants(list);
          if (list.some((p) => p.id === user.uid)) {
            joinedOnceRef.current = true;
          } else if (joinedOnceRef.current) {
            // We were listed before and now we're not — the host removed us.
            setStatus("removed");
          }
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err.message === "This room is full." ? "full" : "not-found");
      });

    return () => {
      cancelled = true;
      unsubRoom();
      unsubParticipants();
    };
  }, [roomId, user, loading]);

  // Heartbeat: every open tab pings "still here". Leaving without pressing
  // "Leave room" (closing the tab, crashing, losing connection) is caught when
  // the heartbeat goes stale. Deliberately no Firestore write in cleanup —
  // React Strict Mode double-invokes effects in dev.
  useEffect(() => {
    if (!user || status !== "ready") return;

    sendHeartbeat(roomId, user.uid).catch(console.error);
    const interval = setInterval(() => {
      sendHeartbeat(roomId, user.uid).catch(console.error);
    }, 20000);

    return () => clearInterval(interval);
  }, [roomId, user, status]);

  useEffect(() => {
    if (status !== "ready") return;

    const interval = setInterval(() => {
      cleanupStaleParticipants(roomId, participants).catch(console.error);
    }, 25000);

    return () => clearInterval(interval);
  }, [roomId, participants, status]);

  useEffect(() => {
    if (status !== "ready") return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  const handleLeave = () => {
    if (user) leaveRoom(roomId, user.uid).catch(console.error);
    navigate("/study-rooms");
  };

  const handleToggleStudying = (studying) => {
    if (!user) return;
    setStudyingStatus(roomId, user.uid, studying).catch(console.error);
  };

  const handleRemove = (targetId, targetName) => {
    if (!window.confirm(`Remove ${targetName} from this room?`)) return;
    leaveRoom(roomId, targetId).catch(console.error);
  };

  const handleDeleteRoom = async () => {
    setDeleteError("");
    try {
      await deleteRoom(roomId);
      navigate("/study-rooms");
    } catch (err) {
      console.error(err);
      setDeleteError(
        err.code === "permission-denied"
          ? "Delete was blocked by Firestore's security rules — check the Rules tab in Firebase Console."
          : "Couldn't delete this room. Please try again."
      );
      setConfirmingDelete(false);
    }
  };

  if (loading || status === "joining") {
    return (
      <>
        <Navbar />
        <main id="main-content" className="wrap page" aria-busy="true">
          <div className="skeleton" style={{ height: 120, marginTop: 30 }} />
          <div className="skeleton" style={{ height: 320, marginTop: 22 }} />
        </main>
      </>
    );
  }

  if (!user) {
    return <Notice title="Sign in required">Sign in using the button at the top right to enter this room.</Notice>;
  }

  if (status === "not-found") return <Notice title="This room doesn't exist." />;
  if (status === "full") return <Notice title="This room is full." />;
  if (status === "removed") return <Notice title="You were removed from this room." />;

  if (!room) return null;

  const isOwner = room.creatorId === user.uid;
  const participantsWithFlag = participants.map((p) => ({ ...p, isCreator: p.id === room.creatorId }));

  return (
    <>
      <Navbar />

      <main id="main-content" className="wrap page">
        <div className="roomhead">
          <div>
            <p className="mono muted small" style={{ marginBottom: 10 }}>
              ROOM № {roomId.slice(0, 4).toUpperCase()} · {room.visibility === "public" ? "PUBLIC" : "PRIVATE"}
            </p>
            <h1>{room.name}</h1>
            <p className="muted" style={{ marginTop: 10 }}>
              {room.subject} · {room.topic} · {participants.length}/{room.maxParticipants} seated
            </p>
            {room.roomCode && (
              <p className="mono small" style={{ marginTop: 8 }}>
                Room code: <span className="badge solid">{room.roomCode}</span>
              </p>
            )}
          </div>

          <div className="btnrow">
            {isOwner && (
              <button
                className={`btn btn-danger${confirmingDelete ? " armed" : ""}`}
                onClick={() => (confirmingDelete ? handleDeleteRoom() : setConfirmingDelete(true))}
                onBlur={() => setConfirmingDelete(false)}
              >
                {confirmingDelete ? "Confirm delete" : "Delete room"}
              </button>
            )}
            <button className="btn btn-alt" onClick={handleLeave}>
              Leave room
            </button>
          </div>
        </div>

        {deleteError && <p className="err">{deleteError}</p>}

        <NotificationPrompt />

        <div className="room-grid">
          <ParticipantsPanel
            participants={participantsWithFlag}
            maxParticipants={room.maxParticipants}
            currentUserId={user.uid}
            onToggleStudying={handleToggleStudying}
            isOwner={isOwner}
            onRemove={handleRemove}
          />
          <StudyTimer roomId={roomId} onStudyingChange={handleToggleStudying} />
          <RoomChat roomId={roomId} roomName={room.name} />
        </div>

        <RoomVideoCall roomId={roomId} />
        <SharedNotes roomId={roomId} roomName={room.name} />
        <AIAssistantPanel
          roomId={roomId}
          context={{ subject: room.subject, topic: room.topic, roomName: room.name }}
        />
      </main>
    </>
  );
}

export default StudyRoomPage;
