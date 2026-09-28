import { useState, useEffect, useRef } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase";
import { useAuth } from "../context/AuthContext";

function initials(name) {
  return (name || "S")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AuthButton() {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef(null);

  const inRoom = /^\/study-room\/[^/]+/.test(location.pathname);

  useEffect(() => {
    if (!showMenu) return;
    const close = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "mousedown" && ref.current?.contains(e.target)) return;
      setShowMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [showMenu]);

  const confirmLeaveRoom = () =>
    !inRoom ||
    window.confirm(
      "Leave this study room? Other participants will see you go offline shortly after."
    );

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    if (!confirmLeaveRoom()) return;
    await signOut(auth);
    setShowMenu(false);
  };

  const handleMenuLink = (e, to) => {
    if (!confirmLeaveRoom()) {
      e.preventDefault();
      return;
    }
    setShowMenu(false);
    if (inRoom) {
      e.preventDefault();
      navigate(to);
    }
  };

  if (!user) {
    return (
      <button className="chip" onClick={handleLogin}>
        Sign in
      </button>
    );
  }

  return (
    <span ref={ref} className="relative">
      <button
        className="av"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Account menu"
        aria-expanded={showMenu}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          initials(user.displayName)
        )}
      </button>

      {showMenu && (
        <div className="menu">
          <div className="who">
            <div style={{ fontWeight: 600 }}>{user.displayName}</div>
            <div className="muted small">{user.email}</div>
          </div>
          <Link to="/library?view=saved" onClick={(e) => handleMenuLink(e, "/library?view=saved")}>
            My library
          </Link>
          <Link to="/library?view=rated" onClick={(e) => handleMenuLink(e, "/library?view=rated")}>
            My ratings
          </Link>
          <button onClick={handleLogout}>Log out</button>
        </div>
      )}
    </span>
  );
}

export default AuthButton;
