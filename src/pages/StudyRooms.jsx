import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

import {
  subscribeToPublicRooms,
  getRoomByCode,
  joinRoom,
  requestPrivateRoomAccess,
  subscribeToMyJoinRequest,
} from "../utils/firestoreRooms";
import { ROOM_CODE_PATTERN, normalizeRoomCode } from "../utils/validation";

import "../styles/rooms.css";

const EMPTY_ROOMS = [];

function StudyRoomCard({ room, onJoin }) {
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const count = room.participantCount || 0;
  const isFull = count >= room.maxParticipants;

  const handleJoin = async () => {
    setJoining(true);
    const result = await onJoin(room);
    if (result?.success) {
      navigate(`/study-room/${room.id}`);
      return;
    }
    setJoining(false);
  };

  return (
    <article className="sh-room-card">
      <div className="sh-room-main">
        <h2>{room.name}</h2>
        <p className="sh-room-host">Hosted by {room.creatorName}</p>
      </div>
      <div className="sh-room-topic">
        <div className="sh-room-subject">{room.subject}</div>
        <div className="sh-room-topic-name">{room.topic}</div>
      </div>
      <div className="sh-room-seats" role="img" aria-label={`${count} of ${room.maxParticipants} seats taken`}>
        {Array.from({ length: room.maxParticipants }, (_, index) => (
          <span key={index} className={`sh-room-seat ${index < count ? `filled ${isFull ? "full" : ""}` : ""}`} />
        ))}
      </div>
      <div className="sh-room-join">
        {isFull ? (
          <button type="button" className="btn btn-alt btn-sm" disabled>Full</button>
        ) : (
          <button type="button" className="btn btn-sm" onClick={handleJoin} disabled={joining}>
            {joining ? "Joining..." : "Join →"}
          </button>
        )}
      </div>
    </article>
  );
}

function StudyRooms() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [requestNotice, setRequestNotice] = useState("");
  const [requestWatch, setRequestWatch] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [roomState, setRoomState] = useState({ userId: null, rooms: EMPTY_ROOMS, loaded: false });

  const rooms = roomState.userId === user?.uid ? roomState.rooms : EMPTY_ROOMS;
  const roomsLoaded = roomState.userId === user?.uid && roomState.loaded;

  useEffect(() => {
    if (authLoading || !user) return undefined;

    const subscriberUserId = user.uid;
    const unsubscribe = subscribeToPublicRooms((data) => {
      setRoomState({ userId: subscriberUserId, rooms: data, loaded: true });
    });

    return () => unsubscribe();
  }, [authLoading, user]);

  useEffect(() => {
    if (!requestWatch || !user || requestWatch.userId !== user.uid) {
      return undefined;
    }

    return subscribeToMyJoinRequest(
      requestWatch.roomId,
      user.uid,
      (request) => {
        if (!request) return;

        if (request.status === "approved") {
          const approvedRoomId = requestWatch.roomId;
          setRequestWatch(null);
          setRequestNotice("");
          navigate(`/study-room/${approvedRoomId}`);
        } else if (request.status === "rejected") {
          setCodeError("The room creator declined your request. Enter the code again if you want to request access again.");
          setRequestNotice("");
          setRequestWatch(null);
        }
      },
      (error) => {
        console.error("Join-request status could not be read:", error);
        setCodeError("Unable to check your join-request status. Please try again.");
        setRequestNotice("");
        setRequestWatch(null);
      }
    );
  }, [requestWatch, user, navigate]);

  const subjects = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.subject).filter(Boolean))),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = rooms;

    if (activeSubject) list = list.filter((room) => room.subject === activeSubject);
    if (query) {
      list = list.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          room.subject.toLowerCase().includes(query) ||
          room.topic.toLowerCase().includes(query)
      );
    }
    return list;
  }, [search, rooms, activeSubject]);

  const handlePublicJoin = async (room) => {
    if (!user) {
      setCodeError("Sign in to join a room.");
      return { success: false };
    }

    try {
      await joinRoom(room.id, user);
      return { success: true };
    } catch (error) {
      setCodeError(error.message);
      return { success: false };
    }
  };

  const handleCodeJoin = async (event) => {
    event.preventDefault();
    setCodeError("");

    if (!user) {
      setCodeError("Sign in to join a room.");
      return;
    }

    const normalized = normalizeRoomCode(roomCode);

    if (!normalized) {
      setCodeError("Enter a room code.");
      return;
    }

    if (!ROOM_CODE_PATTERN.test(normalized)) {
      setCodeError("Enter a valid private room code.");
      return;
    }

    setRoomCode(normalized);
    setCheckingCode(true);

    try {
      const room = await getRoomByCode(normalized);
      if (!room) {
        setCodeError("No private room found with that code.");
        return;
      }

      const result = await requestPrivateRoomAccess(room.id, user, room.inviteHash);

      if (result.status === "member") {
        navigate(`/study-room/${room.id}`);
        return;
      }

      setRequestWatch({ roomId: room.id, userId: user.uid });
      setRequestNotice(`Your request was sent to ${room.creatorName || "the room creator"}. You will enter automatically if it is approved.`);
    } catch (joinError) {
      setCodeError(joinError.message || "Unable to join that room.");
    } finally {
      setCheckingCode(false);
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="sh-rooms-page">
        <div className="sh-rooms-main">
          <header className="sh-rooms-intro">
            <div>
              <div className="sh-rooms-eyebrow">The quiet rooms</div>
              <h1>Rooms in<br /><em>session.</em></h1>
              <p className="sh-rooms-description">
                Small focused rooms for studying together. Five seats, one timer, shared notes, live chat and an AI study assistant.
              </p>
            </div>
            <div className="sh-rooms-create">
              <Link to="/study-rooms/create" className="btn">Open a room</Link>
            </div>
          </header>

          <section className="sh-rooms-controls" aria-label="Room search and private room access">
            <div className="sh-room-field">
              <label htmlFor="room-search">Find a room</label>
              <input
                id="room-search"
                className="sh-room-input"
                type="search"
                placeholder="Search by name, subject or topic..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <form className="sh-room-field" onSubmit={handleCodeJoin}>
              <label htmlFor="room-code">Private room</label>
              <div className="sh-room-code">
                <input
                  id="room-code"
                  className="sh-room-input"
                  type="text"
                  placeholder="SH- followed by 32 characters"
                  value={roomCode}
                  maxLength={35}
                  aria-invalid={Boolean(codeError)}
                  onChange={(event) => {
                    setRoomCode(event.target.value);
                    setCodeError("");
                    setRequestNotice("");
                  }}
                />
                <button className="btn btn-sm" type="submit" disabled={checkingCode}>
                  {checkingCode ? "..." : "Request access"}
                </button>
              </div>
            </form>
          </section>

          {codeError && <p className="err" style={{ marginBottom: 18 }}>{codeError}</p>}
          {requestNotice && (
            <p className="muted" role="status" style={{ marginBottom: 18 }}>
              {requestNotice}
            </p>
          )}

          {subjects.length > 1 && (
            <div className="sh-rooms-filterbar" aria-label="Filter by subject">
              <button
                type="button"
                className={`sh-room-filter ${!activeSubject ? "active" : ""}`}
                aria-pressed={!activeSubject}
                onClick={() => setActiveSubject(null)}
              >All subjects</button>
              {subjects.map((subject) => (
                <button
                  type="button"
                  key={subject}
                  className={`sh-room-filter ${activeSubject === subject ? "active" : ""}`}
                  aria-pressed={activeSubject === subject}
                  onClick={() => setActiveSubject(activeSubject === subject ? null : subject)}
                >{subject}</button>
              ))}
            </div>
          )}

          {!user && !authLoading ? (
            <div className="sh-rooms-empty">
              <h2>Sign in to see<br />the rooms</h2>
              <p>Public study rooms are available to signed-in students.</p>
            </div>
          ) : !roomsLoaded ? (
            <div className="sh-rooms-list">
              {[1, 2, 3].map((item) => <div key={item} className="skeleton" />)}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="sh-rooms-empty">
              <h2>{search || activeSubject ? "No rooms match that." : "The room is waiting."}</h2>
              <p>
                {search || activeSubject
                  ? "Try another search or subject."
                  : "Open a room and invite classmates to study together."}
              </p>
              <Link to="/study-rooms/create" className="btn btn-sm">Open a room</Link>
            </div>
          ) : (
            <div className="sh-rooms-list">
              {filteredRooms.map((room) => <StudyRoomCard key={room.id} room={room} onJoin={handlePublicJoin} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default StudyRooms;
