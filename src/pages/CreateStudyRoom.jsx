import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { createRoomAndJoin } from "../utils/firestoreRooms";

function CreateStudyRoom() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    subject: "",
    topic: "",
    description: "",
    visibility: "public",
    maxParticipants: 5,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.subject.trim() || !form.topic.trim()) {
      setError("Room name, subject, and topic are required.");
      return;
    }

    setSubmitting(true);
    try {
      const room = await createRoomAndJoin(form, user);
      navigate(`/study-room/${room.id}`);
    } catch (err) {
      setError(err.message || "Something went wrong creating the room. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="wrap page">
          <div className="empty" style={{ marginTop: 40 }}>
            <h3>Sign in required</h3>
            <p>Sign in using the button at the top right to open a study room.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main id="main-content" className="wrap page">
        <div className="pagehead">
          <div>
            <p className="mono muted small" style={{ marginBottom: 10 }}>
              § NEW ROOM
            </p>
            <h1>
              Open a <span className="hl">room</span>.
            </h1>
          </div>
        </div>

        <form className="formcard" style={{ marginTop: 26 }} onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="r-name">Room name</label>
            <input id="r-name" className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. DSA Grind" />
          </div>

          <div className="field two">
            <div>
              <label className="label" htmlFor="r-subject">Subject</label>
              <input id="r-subject" className="input" value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="e.g. Data Structures" />
            </div>
            <div>
              <label className="label" htmlFor="r-topic">Topic</label>
              <input id="r-topic" className="input" value={form.topic} onChange={(e) => update("topic", e.target.value)} placeholder="e.g. Trees & Graphs" />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="r-desc">Description</label>
            <textarea id="r-desc" className="input" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What will this room focus on?" />
          </div>

          <div className="field">
            <span className="label">Visibility</span>
            <div className="seg" role="group" aria-label="Visibility">
              {["public", "private"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={form.visibility === option ? "on" : ""}
                  aria-pressed={form.visibility === option}
                  onClick={() => update("visibility", option)}
                  style={{ textTransform: "capitalize" }}
                >
                  {option}
                </button>
              ))}
            </div>
            {form.visibility === "private" && (
              <p className="muted small" style={{ marginTop: 8 }}>
                A unique room code is generated automatically once the room is created.
              </p>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="r-max">Maximum participants</label>
            <select id="r-max" className="input" value={form.maxParticipants} onChange={(e) => update("maxParticipants", Number(e.target.value))}>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} students</option>
              ))}
            </select>
          </div>

          {error && <p className="err">{error}</p>}

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Opening..." : "Open room"}
          </button>
        </form>
      </main>
    </>
  );
}

export default CreateStudyRoom;
