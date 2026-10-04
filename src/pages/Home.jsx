import { useEffect } from "react";

import InteractiveBook from "../components/InteractiveBook";
import DeferredAuth from "../components/DeferredAuth";

import "../styles/home.css";

function Home() {
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
    }
  }, []);

  return (
    <div className="sh-home">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <header className="sh-home-header">
        <div className="sh-wordmark">
          <span className="sh-wordmark-mark">△</span>
          <span>
            StudyHub
            <i>Pro</i>
          </span>
        </div>

        <div className="sh-home-tools">
          <span className="sh-edition">Vol. 01 · Digital study edition</span>
          <DeferredAuth />
        </div>
      </header>

      <main id="main-content">
        <section className="sh-home-main">
          <div className="sh-home-copy">
            <div className="sh-eyebrow">The quiet side of studying</div>

            <p className="sh-welcome">Welcome to StudyHub Pro.</p>

            <h1>
              A space to
              <br />
              <em>study,</em> grow
              <br />
              and achieve more.
            </h1>

            <p className="sh-home-description">
              Notes, resources and focused rooms for people who want to learn without the noise.
            </p>

            <div className="sh-copy-rule" />

            <div className="sh-instruction">
              <span className="sh-instruction-index">01</span>
              <span className="sh-instruction-text">Open the book to begin</span>
            </div>

            <div className="sh-feature-line">
              <span>Study rooms</span>
              <span>Shared notes</span>
              <span>Live chat</span>
              <span>AI tutor</span>
            </div>
          </div>

          <div className="sh-home-book-zone">
            <div className="sh-scene" aria-hidden="true">
              <div className="sh-window">
                <span className="sh-sun" />
                <span className="sh-mountain sh-mountain-back" />
                <span className="sh-mountain" />
                <span className="sh-window-floor" />
              </div>

              <span className="sh-room-glow" />
              <span className="sh-desk" />
              <span className="sh-table-lamp" />
            </div>

            <InteractiveBook />
          </div>
        </section>
      </main>

      <footer className="sh-home-footer">
        <span>StudyHub Pro</span>
        <span>Study quietly · build consistently</span>
        <span>Digital Study Edition · 01</span>
      </footer>
    </div>
  );
}

export default Home;
