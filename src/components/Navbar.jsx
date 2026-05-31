import { FiBookOpen } from "react-icons/fi";
import { useState, useEffect } from "react";
import AuthButton from "./AuthButton";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;

    setDarkMode(newTheme);

    if (newTheme) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "var(--card-bg)",
        borderBottom: "1px solid var(--border)",
        padding: "12px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
          >
            <FiBookOpen size={22} />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
              }}
            >
              StudyHub Pro
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: "12px",
                opacity: 0.6,
              }}
            >
              Learn Smarter
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span>Home</span>
          <span>Library</span>
          <span>Categories</span>

          <button
            onClick={toggleTheme}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <AuthButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;