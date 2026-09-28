import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StudyRoomCard from "../components/StudyRoomCard";
import { useAuth } from "../context/AuthContext";
import { subscribeToPublicRooms, getRoomByCode, joinRoom } from "../utils/firestoreRooms";

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
    // Wait for Firebase Auth to finish restoring the session before
    // subscribing — on a hard refresh, subscribing too early sends an
    // unauthenticated request the security rules reject, and it never retries.
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
    () => Array.from(new Set(rooms.map((r) => r.subject).filter(Boolean))),
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
    } catch (err) {
      setCodeError(err.message);
      return { success: false };
    }
  };

  const handleCodeJoin = async (e) => {
    e.preventDefault();
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
      const room = await getRoomByCode(roomCode);
      if (!room) {
        setCodeError("No private room found with that code.");
        setCheckingCode(false);
        return;
      }
      await joinRoom(room.id, user);
      navigate(`/study-room/${room.id}`);
    } catch (err) {
      setCodeError(err.message);
      setCheckingCode(false);
    }
  };

  return (
    <>
      <Navbar />

      <main id="main-content" className="wrap page">
        <div className="pagehead">
          <div>
            <p className="mono muted small" style={{ marginBottom: 10 }}>
              § STUDY ROOMS
            </p>
            <h1>
              Rooms in <span className="hl">session</span>.
            </h1>
            <p className="sub" style={{ marginBottom: 0 }}>
              Up to five students, one shared timer, live chat, shared notes and an AI tutor built in.
            </p>
          </div>
          <Link to="/study-rooms/create" className="btn">
            Open a room
          </Link>
        </div>

        <div className="controls">
          <div>
            <label htmlFor="room-search" className="sr-only">
              Search rooms
            </label>
            <input
              id="room-search"
              className="input"
              type="text"
              placeholder="Search by name, subject or topic"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <form className="codebox" onSubmit={handleCodeJoin}>
            <label htmlFor="room-code" className="sr-only">
              Private room code
            </label>
            <input
              id="room-code"
              className="input"
              type="text"
              placeholder="Have a room code? SH-7K4P2"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <button className="btn btn-sm" type="submit" disabled={checkingCode}>
              {checkingCode ? "..." : "Join"}
            </button>
          </form>
        </div>

        {codeError && <p className="err">{codeError}</p>}

        {subjects.length > 1 && (
          <div className="chips" style={{ margin: "8px 0 20px" }}>
            <button className="chip" aria-pressed={!activeSubject} onClick={() => setActiveSubject(null)}>
              All subjects
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                className="chip"
                aria-pressed={activeSubject === subject}
                onClick={() => setActiveSubject(activeSubject === subject ? null : subject)}
              >
                {subject}
              </button>
            ))}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--ink)", marginTop: 8 }}>
          {!user && !authLoading ? (
            <div className="empty" style={{ marginTop: 24 }}>
              <h3>Sign in to see the rooms</h3>
              <p>Rooms are visible to signed-in students only.</p>
            </div>
          ) : !roomsLoaded ? (
            [1, 2, 3].map((i) => <div key={i} className="skeleton" />)
          ) : filteredRooms.length === 0 ? (
            <div className="empty" style={{ marginTop: 24 }}>
              <h3>{search || activeSubject ? "No rooms match that" : "No rooms yet — be the first"}</h3>
              <p style={{ marginBottom: 18 }}>
                {search || activeSubject
                  ? "Try a different search, or open your own room."
                  : "Open a room and invite classmates to study together."}
              </p>
              <Link to="/study-rooms/create" className="btn btn-sm">
                Open the first room
              </Link>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <StudyRoomCard key={room.id} room={room} onJoin={handlePublicJoin} />
            ))
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default StudyRooms;
