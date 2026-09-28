import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthButton from "./AuthButton";
import { useAuth } from "../context/AuthContext";
import { subscribeToUserStats } from "../utils/firestoreStats";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Library", to: "/library" },
  { label: "Study rooms", to: "/study-rooms" },
];

const categories = [
  "DSA",
  "Programming Languages",
  "Web Development",
  "Database Systems",
  "Core Computer Science",
];

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Navbar() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [streak, setStreak] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const catRef = useRef(null);

  const inRoom = /^\/study-room\/[^/]+/.test(location.pathname);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setStreak(0);
      return;
    }
    const unsubscribe = subscribeToUserStats(user.uid, (stats) =>
      setStreak(stats.currentStreak || 0)
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!showCategories) return;
    const close = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "mousedown" && catRef.current?.contains(e.target)) return;
      setShowCategories(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [showCategories]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Ask before leaving a study room via any in-app link. The browser's own
  // back/forward buttons are not intercepted.
  const guardedNav = (e, to) => {
    if (!inRoom) return;
    e.preventDefault();
    if (
      window.confirm(
        "Leave this study room? Other participants will see you go offline shortly after."
      )
    ) {
      navigate(to);
    }
  };

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      <div className="wrap">
        <div className="topstrip mono">
          <span className="hide-sm">{today}</span>
          <span className="hide-sm">Vol. 01 · Study edition</span>
          <span className="topr">
            {streak > 0 && (
              <span className="streak" title={`${streak}-day study streak`}>
                {streak}-day streak
              </span>
            )}
            <button
              className="chip"
              onClick={toggleTheme}
              aria-label={darkMode ? "Switch to day edition" : "Switch to night edition"}
            >
              {darkMode ? "Day edition" : "Night edition"}
            </button>
            <AuthButton />
          </span>
        </div>

        <header className="mast">
          <Link to="/" className="brand" onClick={(e) => guardedNav(e, "/")}>
            StudyHub<i>Pro</i>
          </Link>
        </header>
      </div>

      <nav className="idx-bar" aria-label="Sections">
        <div className="wrap idx">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={isActive(item.to) ? "on" : ""}
              aria-current={isActive(item.to) ? "page" : undefined}
              onClick={(e) => guardedNav(e, item.to)}
            >
              {item.label}
            </Link>
          ))}

          <span ref={catRef} className="relative">
            <button
              className="idx-btn"
              onClick={() => setShowCategories(!showCategories)}
              aria-expanded={showCategories}
              aria-haspopup="true"
            >
              Categories ▾
            </button>
            {showCategories && (
              <div className="menu" role="menu">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/category/${category}`}
                    role="menuitem"
                    onClick={(e) => {
                      setShowCategories(false);
                      guardedNav(e, `/category/${category}`);
                    }}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </span>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
