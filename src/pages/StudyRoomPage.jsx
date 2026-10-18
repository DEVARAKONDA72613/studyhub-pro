import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AuthButton from "../components/AuthButton";
import ParticipantsPanel from "../components/ParticipantsPanel";
import RoomChat from "../components/RoomChat";
import StudyTimer from "../components/StudyTimer";
import SharedNotes from "../components/SharedNotes";
import NotificationPrompt from "../components/NotificationPrompt";
import RoomDock from "../components/RoomDock";

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
  getPrivateRoomCode,
  subscribeToJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  removeLegacyParticipantInviteHash,
} from "../utils/firestoreRooms";

import "../styles/study-room.css";

const AIAssistantPanel = lazy(
  () => import("../components/AIAssistantPanel")
);

const RoomVideoCall = lazy(
  () => import("../components/RoomVideoCall")
);

function RoomNotice({ title, children }) {
  return (
    <main className="sh-room-page">
      <header className="sh-room-top">
        <div className="sh-room-brand">
          <span className="sh-room-brand-mark">△</span>
          <span>
            StudyHub
            <i>Pro</i>
          </span>
        </div>

        <AuthButton />
      </header>

      <section className="sh-room-error">
        <div className="sh-room-error-card">
          <h3>{title}</h3>

          {children && <p>{children}</p>}

          <div className="sh-room-error-auth">
            <AuthButton />
          </div>
        </div>
      </section>
    </main>
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
  const [joinRequests, setJoinRequests] = useState([]);
  const [joinRequestError, setJoinRequestError] = useState("");
  const [joinRequestActionId, setJoinRequestActionId] = useState(null);
  const [privateCodeState, setPrivateCodeState] = useState({
    roomId: null,
    userId: null,
    code: "",
  });

  const joinedOnceRef = useRef(false);
  const isRoomOwner = room?.creatorId === user?.uid;

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

        unsubParticipants = subscribeToParticipants(
          roomId,
          (list) => {
            setParticipants(list);

            if (list.some((p) => p.id === user.uid)) {
              joinedOnceRef.current = true;
            } else if (joinedOnceRef.current) {
              setStatus("removed");
            }
          }
        );
      })
      .catch((err) => {
        if (cancelled) return;

        setStatus(
          err.message === "This room is full."
            ? "full"
            : "not-found"
        );
      });

    return () => {
      cancelled = true;
      unsubRoom();
      unsubParticipants();
    };
  }, [roomId, user, loading]);

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
      cleanupStaleParticipants(
        roomId,
        participants,
        user?.uid,
        isRoomOwner
      ).catch(console.error);
    }, 25000);

    return () => clearInterval(interval);
  }, [roomId, participants, status, user, isRoomOwner]);

  useEffect(() => {
    if (!isRoomOwner || room?.visibility !== "private") return;

    getPrivateRoomCode(roomId)
      .then((code) =>
        setPrivateCodeState({
          roomId,
          userId: user.uid,
          code: code || "",
        })
      )
      .catch((error) => {
        console.error("Private room code could not be loaded:", error);
      });
  }, [roomId, isRoomOwner, room?.visibility, user]);

  useEffect(() => {
    if (!user?.uid || !isRoomOwner || room?.visibility !== "private") {
      return undefined;
    }

    return subscribeToJoinRequests(
      roomId,
      setJoinRequests,
      (error) => {
        console.error("Private-room join requests could not be loaded:", error);
        setJoinRequestError("Unable to load pending requests. Check your connection and Firestore rules.");
      }
    );
  }, [roomId, user?.uid, isRoomOwner, room?.visibility]);

  useEffect(() => {
    if (!isRoomOwner) return;

    const legacyParticipants = participants.filter((participant) =>
      Object.prototype.hasOwnProperty.call(participant, "inviteHash")
    );

    legacyParticipants.forEach((participant) => {
      removeLegacyParticipantInviteHash(roomId, participant.id).catch((error) => {
        console.error("Legacy participant invitation data could not be removed:", error);
      });
    });
  }, [roomId, participants, isRoomOwner]);

  useEffect(() => {
    if (status !== "ready") return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () =>
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
  }, [status]);

  const handleLeave = () => {
    if (user) {
      leaveRoom(roomId, user.uid).catch(console.error);
    }

    navigate("/study-rooms");
  };

  const handleToggleStudying = (studying) => {
    if (!user) return;

    setStudyingStatus(
      roomId,
      user.uid,
      studying
    ).catch(console.error);
  };

  const handleRemove = (targetId, targetName) => {
    if (
      !window.confirm(
        `Remove ${targetName} from this room?`
      )
    ) {
      return;
    }

    leaveRoom(roomId, targetId).catch(console.error);
  };

  const handleApproveJoinRequest = async (joinRequest) => {
    setJoinRequestError("");
    setJoinRequestActionId(joinRequest.id);

    try {
      await approveJoinRequest(roomId, joinRequest.id, user);
    } catch (error) {
      console.error("Join request approval failed:", error);
      setJoinRequestError(error.message || "Unable to approve this request.");
    } finally {
      setJoinRequestActionId(null);
    }
  };

  const handleRejectJoinRequest = async (joinRequest) => {
    setJoinRequestError("");
    setJoinRequestActionId(joinRequest.id);

    try {
      await rejectJoinRequest(roomId, joinRequest.id, user);
    } catch (error) {
      console.error("Join request rejection failed:", error);
      setJoinRequestError(error.message || "Unable to reject this request.");
    } finally {
      setJoinRequestActionId(null);
    }
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
      <main className="sh-room-page">
        <header className="sh-room-top">
          <div className="sh-room-brand">
            <span className="sh-room-brand-mark">
              △
            </span>

            <span>
              StudyHub
              <i>Pro</i>
            </span>
          </div>

          <AuthButton />
        </header>

        <section className="sh-room-error">
          <div className="sh-room-error-card">
            <h3>Preparing your room</h3>
            <p>
              Setting the lights, checking the seats...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <RoomNotice title="Sign in required">
        Sign in to enter this study room.
      </RoomNotice>
    );
  }

  if (status === "not-found") {
    return (
      <RoomNotice title="This room doesn't exist." />
    );
  }

  if (status === "full") {
    return (
      <RoomNotice title="This room is full." />
    );
  }

  if (status === "removed") {
    return (
      <RoomNotice title="You were removed from this room." />
    );
  }

  if (!room) {
    return null;
  }

  const isOwner = isRoomOwner;
  const privateRoomCode =
    privateCodeState.roomId === roomId && privateCodeState.userId === user.uid
      ? privateCodeState.code
      : "";

  const participantsWithFlag = participants.map(
    (participant) => ({
      ...participant,
      isCreator:
        participant.id === room.creatorId,
    })
  );

  const roomNumber = roomId
    .slice(0, 4)
    .toUpperCase();

  const seated = participants.length;

  return (
    <main className="sh-room-page">
      <div className="sh-room-scene" aria-hidden="true">
        <div className="sh-room-window">
          <span className="sh-room-sun" />
          <span className="sh-room-mountain back" />
          <span className="sh-room-mountain" />
          <span className="sh-room-window-floor" />
        </div>

        <div className="sh-room-desk" />
      </div>

      <header className="sh-room-top">
        <div className="sh-room-brand">
          <span className="sh-room-brand-mark">
            △
          </span>

          <span>
            StudyHub
            <i>Pro</i>
          </span>
        </div>

        <div className="sh-room-actions">
          <span className="hide-room-mobile">
            <AuthButton />
          </span>
        </div>
      </header>

      <section className="sh-room-main">
        <div className="sh-room-status">
          <span className="sh-room-status-dot" />

          <span>
            Live room · {seated}/{room.maxParticipants} seated
          </span>
        </div>

        <div className="sh-room-heading">
          <div>
            <p className="sh-room-meta">
              ROOM № {roomNumber} ·{" "}
              {room.visibility === "public"
                ? "PUBLIC"
                : "PRIVATE"}
            </p>

            <h1>{room.name}</h1>

            <p className="sh-room-subtitle">
              {room.subject} · {room.topic}
            </p>

            {isOwner && privateRoomCode && (
              <p
                className="sh-room-subtitle"
                style={{ marginTop: 8 }}
              >
                Room code: {privateRoomCode}
              </p>
            )}
          </div>

          <div className="sh-room-heading-buttons">
            {isOwner && (
              <button
                className={`btn btn-danger ${
                  confirmingDelete ? "armed" : ""
                }`}
                onClick={() =>
                  confirmingDelete
                    ? handleDeleteRoom()
                    : setConfirmingDelete(true)
                }
                onBlur={() =>
                  setConfirmingDelete(false)
                }
              >
                {confirmingDelete
                  ? "Confirm delete"
                  : "Delete room"}
              </button>
            )}

            <button
              className="btn"
              onClick={handleLeave}
            >
              Leave room
            </button>
          </div>
        </div>

        {deleteError && (
          <p
            className="err"
            style={{
              marginBottom: 20,
              color: "var(--room-red)",
            }}
          >
            {deleteError}
          </p>
        )}

        <NotificationPrompt />

        <RoomDock />

        {isOwner && room.visibility === "private" && (
          <section className="cell" aria-label="Private room join requests" style={{ marginBottom: 18 }}>
            <h2 className="panel-h">
              Pending requests · {joinRequests.length}
            </h2>

            {joinRequestError && (
              <p className="err" role="alert" style={{ marginBottom: 12 }}>
                {joinRequestError}
              </p>
            )}

            {joinRequests.length === 0 ? (
              <p className="muted small">
                No pending requests. Students who enter your room code will appear here for your approval.
              </p>
            ) : (
              joinRequests.map((joinRequest) => (
                <div
                  key={joinRequest.id}
                  className="ppl-row"
                  style={{ gap: 12, flexWrap: "wrap" }}
                >
                  <div className="ppl-name" style={{ minWidth: 0 }}>
                    <b>{joinRequest.requesterName || "Student"}</b>
                    <span className="muted small" style={{ display: "block" }}>
                      Requested access to this private room
                    </span>
                  </div>

                  <span style={{ display: "flex", gap: 6, flex: "none" }}>
                    <button
                      type="button"
                      className="chip"
                      disabled={joinRequestActionId === joinRequest.id}
                      onClick={() => handleApproveJoinRequest(joinRequest)}
                    >
                      {joinRequestActionId === joinRequest.id ? "Working..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="chip"
                      disabled={joinRequestActionId === joinRequest.id}
                      onClick={() => handleRejectJoinRequest(joinRequest)}
                      style={{ color: "var(--sig)", borderColor: "var(--sig)" }}
                    >
                      Reject
                    </button>
                  </span>
                </div>
              ))
            )}
          </section>
        )}

        <div className="sh-room-grid">
          <ParticipantsPanel
            participants={participantsWithFlag}
            maxParticipants={room.maxParticipants}
            currentUserId={user.uid}
            onToggleStudying={handleToggleStudying}
            isOwner={isOwner}
            onRemove={handleRemove}
          />

          <StudyTimer
            roomId={roomId}
            onStudyingChange={handleToggleStudying}
          />

          <RoomChat
            roomId={roomId}
            roomName={room.name}
          />
        </div>

        <Suspense
          fallback={
            <div className="sh-room-loading-card">
              Loading room tools...
            </div>
          }
        >
          <RoomVideoCall roomId={roomId} />
        </Suspense>

        <SharedNotes
          roomId={roomId}
          roomName={room.name}
        />

        <Suspense
          fallback={
            <div className="sh-room-loading-card">
              Preparing AI assistant...
            </div>
          }
        >
          <AIAssistantPanel
            roomId={roomId}
            context={{
              subject: room.subject,
              topic: room.topic,
              roomName: room.name,
            }}
          />
        </Suspense>
      </section>
    </main>
  );
}

export default StudyRoomPage;
