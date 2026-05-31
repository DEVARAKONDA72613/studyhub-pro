import { useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { Link } from "react-router-dom";

import {
  auth,
  provider,
} from "../firebase";

function AuthButton() {
  const [user, setUser] =
    useState(null);

  const [showMenu, setShowMenu] =
    useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(
        auth,
        provider
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowMenu(false);
  };

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        style={{
          border: "none",
          padding: "10px 18px",
          borderRadius: "12px",
          background:
            "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "white",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Sign In
      </button>
    );
  }

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div
        onClick={() =>
          setShowMenu(!showMenu)
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          padding: "8px 12px",
          borderRadius: "14px",
          border:
            "1px solid var(--border)",
          background:
            "var(--card-bg)",
        }}
      >
        <img
          src={
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.displayName ||
                "User"
            )}`
          }
          alt="profile"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        <span
          style={{
            color:
              "var(--text)",
            fontWeight: "600",
          }}
        >
          {
            user.displayName?.split(
              " "
            )[0]
          }
        </span>
      </div>

      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: 0,
            width: "240px",
            background:
              "var(--card-bg)",
            border:
              "1px solid var(--border)",
            borderRadius: "16px",
            padding: "12px",
            boxShadow:
              "0 15px 35px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                color:
                  "var(--text)",
              }}
            >
              {
                user.displayName
              }
            </div>

            <div
              style={{
                fontSize: "12px",
                opacity: 0.7,
                color:
                  "var(--text)",
              }}
            >
              {user.email}
            </div>
          </div>

          <hr />

          <Link
            to="/library"
            style={menuLink}
          >
            📚 My Library
          </Link>

          <button
            style={menuBtn}
          >
            ⭐ My Ratings
          </button>

          <button
            style={menuBtn}
          >
            👤 Profile
          </button>

          <hr />

          <button
            onClick={
              handleLogout
            }
            style={{
              ...menuBtn,
              color:
                "#ef4444",
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

const menuBtn = {
  width: "100%",
  textAlign: "left",
  padding: "10px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "var(--text)",
  borderRadius: "8px",
};

const menuLink = {
  display: "block",
  width: "100%",
  padding: "10px",
  textDecoration: "none",
  color: "var(--text)",
};

export default AuthButton;