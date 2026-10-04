import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdArrowForward,
  MdAutoAwesome,
  MdCollectionsBookmark,
  MdForum,
  MdMenuBook,
  MdPersonOutline,
} from "react-icons/md";

import DeferredAuth from "./DeferredAuth";

const menuItems = [
  {
    id: "rooms",
    title: "Study Rooms",
    description: "Focus together",
    icon: MdMenuBook,
    type: "route",
    path: "/study-rooms",
  },
  {
    id: "resources",
    title: "Resources",
    description: "Books, notes and more",
    icon: MdCollectionsBookmark,
    type: "route",
    path: "/library",
  },
  {
    id: "discussions",
    title: "Discussions",
    description: "Ask, share, learn",
    icon: MdForum,
    type: "route",
    path: "/study-rooms",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Build and collaborate",
    icon: MdAutoAwesome,
    type: "soon",
  },
  {
    id: "profile",
    title: "Profile",
    description: "Your journey",
    icon: MdPersonOutline,
    type: "profile",
  },
];

function MenuItem({ item, index, onNavigate, onProfile, onSoon }) {
  const Icon = item.icon;

  const handleClick = () => {
    if (item.type === "route") {
      onNavigate(item.path, item.title);
      return;
    }

    if (item.type === "profile") {
      onProfile();
      return;
    }

    onSoon();
  };

  return (
    <motion.button
      type="button"
      className={`sh-book-menu-item ${item.type === "soon" ? "is-soon" : ""}`}
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.26 + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={handleClick}
    >
      <span className="sh-book-menu-icon">
        <Icon aria-hidden="true" />
      </span>

      <span className="sh-book-menu-copy">
        <strong>{item.title}</strong>
        <small>{item.description}</small>
      </span>

      {item.type === "soon" ? (
        <span className="sh-book-menu-soon">SOON</span>
      ) : (
        <span className="sh-book-menu-arrow">
          <MdArrowForward aria-hidden="true" />
        </span>
      )}
    </motion.button>
  );
}

function InteractiveBook() {
  const navigate = useNavigate();
  const stageRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [innerView, setInnerView] = useState("menu");
  const [notice, setNotice] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [destination, setDestination] = useState("");

  const resetTilt = () => {
    if (!stageRef.current) return;

    stageRef.current.style.setProperty("--sh-tilt-x", "0deg");
    stageRef.current.style.setProperty("--sh-tilt-y", "0deg");
  };

  const handlePointerMove = (event) => {
    if (!stageRef.current || isOpen) return;
    if (window.innerWidth < 900) return;

    const rect = stageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 7;
    const rotateX = (0.5 - y) * 5;

    stageRef.current.style.setProperty("--sh-tilt-x", `${rotateX.toFixed(2)}deg`);
    stageRef.current.style.setProperty("--sh-tilt-y", `${rotateY.toFixed(2)}deg`);
  };

  const openBook = () => {
    resetTilt();
    setNotice("");
    setInnerView("menu");
    setIsOpen(true);
  };

  const closeBook = () => {
    setNotice("");
    setInnerView("menu");
    setIsOpen(false);
  };

  const beginNavigation = (path, label) => {
    setNotice("");
    setDestination(label);
    setLeaving(true);

    window.setTimeout(() => {
      navigate(path);
    }, 720);
  };

  const handleSoon = () => {
    setNotice("Projects are the next chapter. Coming soon.");
  };

  return (
    <div className="sh-book-root">
      <div
        ref={stageRef}
        className={`sh-book-stage ${isOpen ? "is-open" : "is-closed"}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <div className="sh-book-shadow" aria-hidden="true" />

        <div className="sh-prop-stack" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="sh-book-tilt">
          <motion.div
            layout
            className={`sh-book ${isOpen ? "is-open" : "is-closed"}`}
            transition={{
              layout: {
                duration: 0.92,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
          >
            <div className="sh-book-page-block" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>

            <motion.div
              className="sh-open-spread"
              initial={false}
              animate={{
                opacity: isOpen ? 1 : 0,
                scale: isOpen ? 1 : 0.94,
                y: isOpen ? 0 : 10,
              }}
              transition={{
                duration: 0.62,
                delay: isOpen ? 0.32 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="sh-page sh-page-left">
                <div className="sh-page-curl" aria-hidden="true" />

                <button
                  type="button"
                  className="sh-page-back"
                  onClick={closeBook}
                  aria-label="Close the book"
                >
                  <MdArrowBack aria-hidden="true" />
                </button>

                <div className="sh-left-page-content">
                  <span className="sh-page-kicker">STUDYHUB PRO · 01</span>

                  <h2>
                    Where would
                    <br />
                    you like
                    <br />
                    to begin?
                  </h2>

                  <p>
                    Different spaces
                    <br />
                    for different minds.
                  </p>

                  <div className="sh-botanical" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="sh-page-number">01</div>
              </div>

              <div className="sh-page sh-page-right">
                <div className="sh-page-curl right" aria-hidden="true" />

                <AnimatePresence mode="wait">
                  {innerView === "menu" ? (
                    <motion.div
                      key="menu"
                      className="sh-menu-view"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="sh-menu-heading">
                        <span>CHAPTERS</span>
                        <small>Select a space.</small>
                      </div>

                      <div className="sh-book-menu">
                        {menuItems.map((item, index) => (
                          <MenuItem
                            key={item.id}
                            item={item}
                            index={index}
                            onNavigate={beginNavigation}
                            onProfile={() => {
                              setNotice("");
                              setInnerView("profile");
                            }}
                            onSoon={handleSoon}
                          />
                        ))}
                      </div>

                      <AnimatePresence>
                        {notice && (
                          <motion.div
                            className="sh-book-notice"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                          >
                            {notice}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="sh-page-footer">
                        <span>Study · Focus · Grow</span>
                        <span>02</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="profile"
                      className="sh-profile-view"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button
                        type="button"
                        className="sh-inner-back"
                        onClick={() => {
                          setNotice("");
                          setInnerView("menu");
                        }}
                      >
                        <MdArrowBack aria-hidden="true" />
                        Back
                      </button>

                      <div className="sh-profile-icon">
                        <MdPersonOutline aria-hidden="true" />
                      </div>

                      <span className="sh-page-kicker">YOUR JOURNEY</span>

                      <h3>Profile</h3>

                      <p className="sh-profile-text">
                        Sign in to keep your library, ratings and learning journey connected across StudyHub.
                      </p>

                      <div className="sh-profile-auth">
                        <DeferredAuth />
                      </div>

                      <div className="sh-page-footer">
                        <span>StudyHub Pro</span>
                        <span>02</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.button
              type="button"
              className="sh-closed-cover"
              initial={false}
              animate={{
                rotateY: isOpen ? -176 : 0,
                width: isOpen ? "50.2%" : "100%",
              }}
              transition={{
                duration: 1.02,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: "left center" }}
              onClick={!isOpen ? openBook : undefined}
              disabled={isOpen}
              aria-label="Open StudyHub Pro"
            >
              <span className="sh-cover-highlight" aria-hidden="true" />
              <span className="sh-cover-border" aria-hidden="true" />

              <span className="sh-cover-content">
                <span className="sh-cover-symbol">
                  <MdMenuBook aria-hidden="true" />
                </span>

                <span className="sh-cover-title">
                  StudyHub
                  <i>Pro</i>
                </span>

                <span className="sh-cover-rule" />

                <span className="sh-cover-sub">
                  THE QUIET
                  <br />
                  DIGITAL EDITION
                </span>

                <span className="sh-cover-mark">✦</span>
              </span>
            </motion.button>

            <div className="sh-book-spine" aria-hidden="true" />
          </motion.div>
        </div>

        {!isOpen && (
          <motion.div
            className="sh-open-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45 }}
          >
            <span>Open the book</span>
            <span className="sh-open-hint-arrow">
              <MdArrowForward aria-hidden="true" />
            </span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {leaving && (
          <motion.div
            className="sh-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
          >
            <motion.div
              className="sh-transition-inner"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
            >
              <span>Entering</span>
              <strong>{destination}</strong>

              <div className="sh-transition-line">
                <motion.i
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.62, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InteractiveBook;
