import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { books } from "../data/books";

import "../styles/library.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "saved", label: "Saved" },
  { id: "rated", label: "Rated" },
];

const EMPTY_COPY = {
  all: {
    title: "Nothing matches that search",
    body: "Try a different keyword, or clear the search.",
  },
  saved: {
    title: "No saved notes yet",
    body: "Tap Save on any note to add it here.",
  },
  rated: {
    title: "No rated notes yet",
    body: "Rate a note to see it here.",
  },
};

function LibraryCard({ book, onSavedChange }) {
  const [views, setViews] = useState(book.views || 0);
  const [downloads, setDownloads] = useState(book.downloads || 0);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const savedViews = Number(localStorage.getItem(`views-${book.id}`)) || book.views || 0;
    const savedDownloads = Number(localStorage.getItem(`downloads-${book.id}`)) || book.downloads || 0;
    const savedProgress = Number(localStorage.getItem(`progress-${book.id}`)) || 0;
    const savedRating = Number(localStorage.getItem(`rating-${book.id}`)) || 0;
    const library = JSON.parse(localStorage.getItem("library")) || [];

    setViews(savedViews);
    setDownloads(savedDownloads);
    setProgress(savedProgress);
    setUserRating(savedRating);
    setSaved(library.includes(book.id));
  }, [book.id, book.views, book.downloads]);

  const handleView = () => {
    const newViews = views + 1;
    const newProgress = Math.min(progress + 10, 100);

    localStorage.setItem(`views-${book.id}`, newViews);
    localStorage.setItem(`progress-${book.id}`, newProgress);

    setViews(newViews);
    setProgress(newProgress);

    if (book.viewLink) {
      window.open(book.viewLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = () => {
    const newDownloads = downloads + 1;

    localStorage.setItem(`downloads-${book.id}`, newDownloads);
    setDownloads(newDownloads);

    if (book.downloadLink) {
      window.open(book.downloadLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleSave = () => {
    const library = JSON.parse(localStorage.getItem("library")) || [];

    let nextLibrary;

    if (library.includes(book.id)) {
      nextLibrary = library.filter((id) => id !== book.id);
      setSaved(false);
    } else {
      nextLibrary = [...library, book.id];
      setSaved(true);
    }

    localStorage.setItem("library", JSON.stringify(nextLibrary));

    onSavedChange?.();
  };

  const handleRating = (rating) => {
    localStorage.setItem(`rating-${book.id}`, rating);
    setUserRating(rating);
    onSavedChange?.();
  };

  return (
    <article className="sh-library-card">
      <div className="sh-library-card-top">
        <div className="sh-library-cover" style={{ background: book.color }} aria-hidden="true">
          <span className="sh-library-cover-icon">{book.icon}</span>
        </div>

        <span className="sh-library-category">{book.category}</span>
      </div>

      <h2>{book.title}</h2>

      <div className="sh-library-stats">
        <span>★ {book.rating}</span>
        <span>{views.toLocaleString()} views</span>
        <span>{downloads.toLocaleString()} downloads</span>
      </div>

      <div className="sh-library-actions">
        <button type="button" className="sh-library-action primary" onClick={handleView}>
          View
        </button>

        <button type="button" className="sh-library-action" onClick={handleDownload}>
          Download
        </button>

        <button
          type="button"
          className={`sh-library-action save ${saved ? "saved" : ""}`}
          onClick={handleSave}
          aria-pressed={saved}
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <div className="sh-library-rating">
        <div className="sh-library-rating-head">
          <span>
            YOUR RATING
            {userRating > 0 ? ` · ${userRating}/5` : ""}
          </span>
        </div>

        <div className="sh-library-stars" role="group" aria-label="Your rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`sh-library-star ${star <= userRating ? "active" : ""}`}
              onClick={() => handleRating(star)}
              aria-label={`Rate ${star} out of 5`}
              aria-pressed={star <= userRating}
            >
              {star <= userRating ? "★" : "☆"}
            </button>
          ))}
        </div>

        <div
          className="sh-library-progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        <div
          className="mono"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: 7,
            color: "var(--ink2)",
          }}
        >
          <span>CONTINUE READING</span>
          <span>{progress}%</span>
        </div>
      </div>

      {book.recommended?.length > 0 && (
        <div className="sh-library-recommended">
          <p className="sh-library-recommended-title">RECOMMENDED NEXT</p>

          <ul>
            {book.recommended.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function Library() {
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get("view");

  const [savedIds, setSavedIds] = useState([]);
  const [ratedIds, setRatedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState(
    FILTERS.some((filter) => filter.id === initialView) ? initialView : "all"
  );
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setSavedIds(JSON.parse(localStorage.getItem("library")) || []);
      setRatedIds(
        books
          .filter((book) => Number(localStorage.getItem(`rating-${book.id}`)) > 0)
          .map((book) => book.id)
      );
    };

    refresh();
  }, [refreshKey]);

  const visibleBooks = useMemo(() => {
    let list = books;

    if (activeFilter === "saved") {
      list = list.filter((book) => savedIds.includes(book.id));
    }

    if (activeFilter === "rated") {
      list = list.filter((book) => ratedIds.includes(book.id));
    }

    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.category.toLowerCase().includes(query)
      );
    }

    return list;
  }, [activeFilter, savedIds, ratedIds, search, refreshKey]);

  const empty = EMPTY_COPY[search.trim() ? "all" : activeFilter];
  const forceRefresh = () => setRefreshKey((value) => value + 1);

  return (
    <>
      <Navbar />

      <main id="main-content" className="sh-library-page">
        <div className="sh-library-main">
          <header className="sh-library-intro">
            <div>
              <div className="sh-library-eyebrow">The StudyHub archive</div>

              <h1>
                Every note,
                <br />
                <em>in one place.</em>
              </h1>

              <p className="sh-library-copy">
                A growing shelf of resources for the subjects you're building, revising and mastering.
              </p>
            </div>

            <div className="sh-library-filters">
              <div className="sh-library-segment" role="group" aria-label="Filter library">
                {FILTERS.map((filter) => (
                  <button
                    type="button"
                    key={filter.id}
                    className={activeFilter === filter.id ? "active" : ""}
                    onClick={() => setActiveFilter(filter.id)}
                    aria-pressed={activeFilter === filter.id}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="sh-library-search-wrap">
            <label className="sh-library-search-label" htmlFor="library-search">
              Search the archive
            </label>

            <input
              id="library-search"
              className="sh-library-search"
              type="search"
              placeholder="Search subjects, notes or categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="sh-library-results-meta">
            <span>
              {visibleBooks.length} {visibleBooks.length === 1 ? "resource" : "resources"}
            </span>

            <span>{activeFilter === "all" ? "Full collection" : `${activeFilter} collection`}</span>
          </div>

          {visibleBooks.length === 0 ? (
            <div className="sh-library-empty">
              <h2>{empty.title}</h2>
              <p>{empty.body}</p>
            </div>
          ) : (
            <div className="sh-library-grid">
              {visibleBooks.map((book) => (
                <LibraryCard
                  key={`${book.id}-${refreshKey}`}
                  book={book}
                  onSavedChange={forceRefresh}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Library;
