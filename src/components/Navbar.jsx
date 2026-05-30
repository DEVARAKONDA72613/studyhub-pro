import { FiBookOpen } from "react-icons/fi";
import { useState, useEffect } from "react";
import AuthButton from "./AuthButton";

function Navbar() {
  const [darkMode, setDarkMode] =
    useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme");

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
      localStorage.setItem(
        "theme",
        "dark"
      );
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem(
        "theme",
        "light"
      );
    }
  };

  return (
    <nav
      style={{
        padding: "20px 40px",
        borderBottom:
          "1px solid var(--border)",
        background: "var(--card-bg)",
        transition: "0.3s",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <FiBookOpen size={24} />

          <h2
            style={{
              margin: 0,
            }}
          >
            StudyHub Pro
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              cursor: "pointer",
            }}
          >
            Home
          </span>

          <span
            style={{
              cursor: "pointer",
            }}
          >
            Library
          </span>

          <span
            style={{
              cursor: "pointer",
            }}
          >
            Categories
          </span>

          <AuthButton />

          <button
            onClick={toggleTheme}
            style={{
              border: "none",
              padding: "10px 14px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "18px",
              background:
                "var(--card-bg)",
              color: "var(--text)",
              border:
                "1px solid var(--border)",
            }}
          >
            {darkMode
              ? "☀️"
              : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;