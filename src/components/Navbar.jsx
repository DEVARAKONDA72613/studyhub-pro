import { FiBookOpen } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";

function Navbar() {
  const [darkMode, setDarkMode] =
    useState(false);

  const [showCategories, setShowCategories] =
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
      document.body.classList.remove(
        "dark"
      );
      localStorage.setItem(
        "theme",
        "light"
      );
    }
  };

  const categories = [
    "DSA",
    "Programming Languages",
    "Web Development",
    "Database Systems",
    "Core Computer Science",
  ];

  const linkStyle = {
    textDecoration: "none",
    color: "var(--text)",
    fontWeight: "600",
    fontSize: "15px",
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "var(--card-bg)",
        borderBottom:
          "1px solid var(--border)",
        padding: "14px 24px",
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
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "inherit",
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
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                justifyContent:
                  "center",
                alignItems: "center",
                color: "white",
              }}
            >
              <FiBookOpen size={24} />
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
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Link
            to="/"
            style={linkStyle}
          >
            Home
          </Link>

          <Link
            to="/library"
            style={linkStyle}
          >
            Library
          </Link>

          <div
            style={{
              position: "relative",
            }}
          >
            <button
              onClick={() =>
                setShowCategories(
                  !showCategories
                )
              }
              style={{
                border: "none",
                background:
                  "transparent",
                cursor: "pointer",
                color:
                  "var(--text)",
                fontWeight:
                  "600",
                fontSize: "15px",
              }}
            >
              Categories
            </button>

            {showCategories && (
              <div
                style={{
                  position:
                    "absolute",
                  top: "45px",
                  right: 0,
                  width: "250px",
                  background:
                    "var(--card-bg)",
                  border:
                    "1px solid var(--border)",
                  borderRadius:
                    "14px",
                  overflow:
                    "hidden",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.15)",
                }}
              >
                {categories.map(
                  (category) => (
                    <Link
                      key={category}
                      to={`/category/${category}`}
                      onClick={() =>
                        setShowCategories(
                          false
                        )
                      }
                      style={{
                        display:
                          "block",
                        padding:
                          "14px 18px",
                        color:
                          "var(--text)",
                        textDecoration:
                          "none",
                        borderBottom:
                          "1px solid var(--border)",
                      }}
                    >
                      {category}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            style={{
              width: "42px",
              height: "42px",
              borderRadius:
                "12px",
              border:
                "1px solid var(--border)",
              background:
                "var(--card-bg)",
              color:
                "var(--text)",
              cursor:
                "pointer",
              fontSize:
                "18px",
            }}
          >
            {darkMode
              ? "☀️"
              : "🌙"}
          </button>

          <AuthButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;