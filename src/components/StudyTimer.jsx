import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { setTimerState } from "../utils/firestoreRooms";
import { recordFocusSession } from "../utils/firestoreStats";

const DURATIONS = { focus: 25 * 60 * 1000, break: 5 * 60 * 1000 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ n }) {
  return (
    <span className="d">
      <span className="dstrip" style={{ transform: `translateY(-${n}em)` }}>
        {DIGITS.map((i) => (
          <span key={i}>{i}</span>
        ))}
      </span>
    </span>
  );
}

function StudyTimer({ roomId, onStudyingChange }) {
  const { user } = useAuth();
  const [mode, setMode] = useState("focus");
  const [remainingMs, setRemainingMs] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [resourceUrl, setResourceUrl] = useState("");
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [warning, setWarning] = useState("");

  const endsAtRef = useRef(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!running) return;

    endsAtRef.current = Date.now() + remainingMs;

    intervalRef.current = setInterval(() => {
      const remaining = endsAtRef.current - Date.now();

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setRemainingMs(0);

        if (mode === "focus") {
          onStudyingChange?.(false);
          if (user) recordFocusSession(user, 25).catch(console.error);
        }

        setWarning(
          mode === "focus"
            ? "Focus session complete. Time for a break."
            : "Break's over — ready for another focus session?"
        );
        return;
      }

      setRemainingMs(remaining);
    }, 1000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (!user) return;
    const state = running ? { mode, running: true, endsAt: Date.now() + remainingMs } : null;
    setTimerState(roomId, user.uid, state).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && focusModeActive) {
        setFocusModeActive(false);
        if (running && mode === "focus") {
          setRunning(false);
          setDistractionCount((c) => c + 1);
          setWarning("You exited fullscreen — session paused. Resume when you're ready to refocus.");
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && running && mode === "focus" && focusModeActive) {
        setRunning(false);
        setDistractionCount((c) => c + 1);
        setWarning("You switched away from this tab — session paused.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [running, mode, focusModeActive]);

  const switchMode = (next) => {
    if (running) return;
    setMode(next);
    setRemainingMs(DURATIONS[next]);
    setWarning("");
  };

  const handleStart = async () => {
    setWarning("");
    if (remainingMs <= 0) setRemainingMs(DURATIONS[mode]);
    setRunning(true);

    if (mode === "focus") {
      onStudyingChange?.(true);
      if (containerRef.current?.requestFullscreen) {
        try {
          await containerRef.current.requestFullscreen();
          setFocusModeActive(true);
        } catch {
          // Fullscreen can be blocked by the browser — the timer still works without it.
        }
      }
    }
  };

  const handleReset = () => {
    setRunning(false);
    setRemainingMs(DURATIONS[mode]);
    setWarning("");
    setDistractionCount(0);
    if (mode === "focus") onStudyingChange?.(false);
    if (document.fullscreenElement) document.exitFullscreen?.();
  };

  const exitFocusView = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    setFocusModeActive(false);
  };

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const digits = [Math.floor(m / 10), m % 10, Math.floor(s / 10), s % 10];

  return (
    <section
      ref={containerRef}
      className="cell"
      aria-label="Study timer"
      style={focusModeActive ? { background: "var(--paper)", overflow: "auto" } : undefined}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="panel-h">{mode === "focus" ? "Focus · 25 min" : "Break · 5 min"}</h2>
        {focusModeActive && (
          <button className="chip" onClick={exitFocusView}>
            Exit focus view
          </button>
        )}
      </div>

      <div className="modes">
        {["focus", "break"].map((k) => (
          <button
            key={k}
            className="chip"
            aria-pressed={mode === k}
            disabled={running}
            onClick={() => switchMode(k)}
          >
            {k === "focus" ? "25 min focus" : "5 min break"}
          </button>
        ))}
      </div>

      <div
        className="clock"
        role="timer"
        aria-label={`${m} minutes ${s} seconds remaining`}
      >
        <Digit n={digits[0]} />
        <Digit n={digits[1]} />
        <span className="col">:</span>
        <Digit n={digits[2]} />
        <Digit n={digits[3]} />
      </div>

      {warning && (
        <div className="warn" role="status">
          <span>{warning}</span>
        </div>
      )}

      <div className="ctl">
        {!running ? (
          <button className="btn" onClick={handleStart}>
            {remainingMs < DURATIONS[mode] && remainingMs > 0 ? "Resume" : "Start"}
          </button>
        ) : (
          <button className="btn btn-alt" onClick={() => setRunning(false)}>
            Pause
          </button>
        )}
        <button className="btn btn-alt" onClick={handleReset} aria-label="Reset timer">
          Reset
        </button>
      </div>

      {mode === "focus" && !focusModeActive && (
        <div>
          <label className="label" htmlFor="focus-resource">
            Focus resource (optional)
          </label>
          <input
            id="focus-resource"
            className="input"
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            placeholder="Paste a PDF or resource link"
          />
          <p className="muted small" style={{ marginTop: 6 }}>
            Opens beside your timer in fullscreen so you don't need another tab. Not every site
            allows being embedded — the timer still works on its own.
          </p>
        </div>
      )}

      {focusModeActive && resourceUrl && (
        <iframe
          src={resourceUrl}
          title="Focus resource"
          style={{ width: "100%", height: "50vh", border: "1.5px solid var(--ink)", marginTop: 16 }}
        />
      )}

      {distractionCount > 0 && (
        <p className="muted mono small" style={{ marginTop: 12, textAlign: "center" }}>
          Left focus mode {distractionCount} time{distractionCount > 1 ? "s" : ""} this session
        </p>
      )}
    </section>
  );
}

export default StudyTimer;
