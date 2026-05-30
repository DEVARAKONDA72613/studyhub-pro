import { FiBookOpen } from "react-icons/fi";
import { useState, useEffect } from "react";

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
        borderBottom: "1px solid var(--border)",
        background: "var(--card-bg)",
        transition: "0.3s",
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
            gap: "10px",
            alignItems: "center",
          }}
        >
          <FiBookOpen size={24} />
          <h2>StudyHub Pro</h2>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <span>Home</span>
          <span>Library</span>
          <span>Categories</span>

          <button
            onClick={toggleTheme}
            style={{
              border: "none",
              padding: "10px 14px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;