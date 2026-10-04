import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

import {
  subscribeToPublicRooms,
  getRoomByCode,
  joinRoom,
} from "../utils/firestoreRooms";

import "../styles/rooms.css";

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

      <div
        className="sh-room-seats"
        role="img"
        aria-label={`${count} of ${room.maxParticipants} seats taken`}
      >
        {Array.from({ length: room.maxParticipants }, (_, index) => (
          <span
            key={index}
            className={`sh-room-seat ${index < count ? `filled ${isFull ? "full" : ""}` : ""}`}
          />
        ))}
      </div>

      <div className="sh-room-join">
        {isFull ? (
          <button type="button" className="btn btn-alt btn-sm" disabled>
            Full
          </button>
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
  const [activeSubject, setActiveSubject] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [roomsLoaded, setRoomsLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setRoomsLoaded(false);
      return;
    }

    const unsubscribe = subscribeToPublicRooms((data) => {
      setRooms(data);
      setRoomsLoaded(true);
    });

    return () => unsubscribe();
  }, [authLoading, user]);

  const subjects = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.subject).filter(Boolean))),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = rooms;

    if (activeSubject) {
      list = list.filter((room) => room.subject === activeSubject);
    }

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

    if (!roomCode.trim()) {
      setCodeError("Enter a room code.");
      return;
    }

    setCheckingCode(true);

    try {
      const room = await getRoomByCode(roomCode.trim());

      if (!room) {
        setCodeError("No private room found with that code.");
        setCheckingCode(false);
        return;
      }

      await joinRoom(room.id, user);
      navigate(`/study-room/${room.id}`);
    } catch (error) {
      setCodeError(error.message);
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

              <h1>
                Rooms in
                <br />
                <em>session.</em>
              </h1>

              <p className="sh-rooms-description">
                Small focused rooms for studying together. Five seats, one timer, shared notes, live chat and an AI study assistant.
              </p>
            </div>

            <div className="sh-rooms-create">
              <Link to="/study-rooms/create" className="btn">
                Open a room
              </Link>
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
                  placeholder="SH-7K4P2"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value)}
                />

                <button className="btn btn-sm" type="submit" disabled={checkingCode}>
                  {checkingCode ? "..." : "Join"}
                </button>
              </div>
            </form>
          </section>

          {codeError && (
            <p className="err" style={{ marginBottom: 18 }}>
              {codeError}
            </p>
          )}

          {subjects.length > 1 && (
            <div className="sh-rooms-filterbar" aria-label="Filter by subject">
              <button
                type="button"
                className={`sh-room-filter ${!activeSubject ? "active" : ""}`}
                aria-pressed={!activeSubject}
                onClick={() => setActiveSubject(null)}
              >
                All subjects
              </button>

              {subjects.map((subject) => (
                <button
                  type="button"
                  key={subject}
                  className={`sh-room-filter ${activeSubject === subject ? "active" : ""}`}
                  aria-pressed={activeSubject === subject}
                  onClick={() => setActiveSubject(activeSubject === subject ? null : subject)}
                >
                  {subject}
                </button>
              ))}
            </div>
          )}

          {!user && !authLoading ? (
            <div className="sh-rooms-empty">
              <h2>
                Sign in to see
                <br />
                the rooms
              </h2>

              <p>Public study rooms are available to signed-in students.</p>
            </div>
          ) : !roomsLoaded ? (
            <div className="sh-rooms-list">
              {[1, 2, 3].map((item) => (
                <div key={item} className="skeleton" />
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="sh-rooms-empty">
              <h2>{search || activeSubject ? "No rooms match that." : "The room is waiting."}</h2>

              <p>
                {search || activeSubject
                  ? "Try another search or subject."
                  : "Open a room and invite classmates to study together."}
              </p>

              <Link to="/study-rooms/create" className="btn btn-sm">
                Open a room
              </Link>
            </div>
          ) : (
            <div className="sh-rooms-list">
              {filteredRooms.map((room) => (
                <StudyRoomCard key={room.id} room={room} onJoin={handlePublicJoin} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default StudyRooms;
