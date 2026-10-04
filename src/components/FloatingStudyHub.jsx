import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdMenuBook } from "react-icons/md";

function FloatingStudyHub() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showTip, setShowTip] = useState(false);

  const inRoom = /^\/study-room\/[^/]+/.test(location.pathname);

  const handleClick = (event) => {
    if (!inRoom) return;

    event.preventDefault();

    const confirmed = window.confirm(
      "Leave this study room? Other participants will see you go offline shortly after."
    );

    if (confirmed) {
      navigate("/");
    }
  };

  if (location.pathname === "/") {
    return null;
  }

  return (
    <motion.div
      style={{
        position: "fixed",
        right: "clamp(16px, 3vw, 34px)",
        bottom: "clamp(18px, 3vw, 34px)",
        zIndex: 9000,
      }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onFocus={() => setShowTip(true)}
      onBlur={() => setShowTip(false)}
    >
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute",
              right: 0,
              bottom: "calc(100% + 11px)",
              whiteSpace: "nowrap",
              padding: "8px 12px",
              borderRadius: 999,
              background: "#211b15",
              color: "#f0e5d2",
              border: "1px solid rgba(239,229,209,.18)",
              boxShadow: "0 12px 28px rgba(0,0,0,.3)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 9,
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            Open StudyHub
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{
          y: -4,
          rotate: -1,
          scale: 1.04,
        }}
        whileTap={{
          scale: 0.96,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 22,
        }}
      >
        <Link
          to="/"
          onClick={handleClick}
          aria-label="Open StudyHub"
          style={{
            width: 70,
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            textDecoration: "none",
            color: "#f5e9d2",
            background: "linear-gradient(145deg,#30261b,#17120d)",
            border: "1px solid rgba(216,180,119,.42)",
            boxShadow:
              "0 15px 34px rgba(0,0,0,.34), inset 0 0 20px rgba(255,211,147,.06)",
          }}
        >
          <span
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              border: "1px solid rgba(216,180,119,.16)",
            }}
          >
            <MdMenuBook
              aria-hidden="true"
              style={{
                width: 29,
                height: 29,
                strokeWidth: 1,
              }}
            />
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default FloatingStudyHub;
