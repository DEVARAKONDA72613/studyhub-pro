import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { books } from "../data/books";
import BookCard from "../components/BookCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "saved", label: "Saved" },
  { id: "rated", label: "Rated" },
];

const EMPTY_COPY = {
  all: { title: "Nothing matches that search", body: "Try a different keyword, or clear the search." },
  saved: { title: "No saved notes yet", body: "Tap Save on any note to add it here." },
  rated: { title: "No rated notes yet", body: "Rate a note to see it here." },
};

function Library() {
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get("view");

  const [savedIds, setSavedIds] = useState([]);
  const [ratedIds, setRatedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState(
    FILTERS.some((f) => f.id === initialView) ? initialView : "all"
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSavedIds(JSON.parse(localStorage.getItem("library")) || []);
    setRatedIds(
      books
        .filter((book) => Number(localStorage.getItem(`rating-${book.id}`)) > 0)
        .map((book) => book.id)
    );
  }, []);

  const visibleBooks = useMemo(() => {
    let list = books;
    if (activeFilter === "saved") list = list.filter((book) => savedIds.includes(book.id));
    if (activeFilter === "rated") list = list.filter((book) => ratedIds.includes(book.id));

    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (book) =>
          book.title.toLowerCase().includes(query) || book.category.toLowerCase().includes(query)
      );
    }
    return list;
  }, [activeFilter, savedIds, ratedIds, search]);

  const empty = EMPTY_COPY[search.trim() ? "all" : activeFilter];

  return (
    <>
      <Navbar />

      <main id="main-content" className="wrap page">
        <div className="pagehead">
          <div>
            <p className="mono muted small" style={{ marginBottom: 10 }}>
              § THE LIBRARY
            </p>
            <h1>
              Every note, <span className="hl">in one place</span>.
            </h1>
          </div>

          <div className="seg" role="group" aria-label="Filter notes">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                className={activeFilter === filter.id ? "on" : ""}
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 440, margin: "26px 0 30px" }}>
          <label htmlFor="lib-search" className="sr-only">
            Search the library
          </label>
          <input
            id="lib-search"
            className="input"
            type="text"
            placeholder="Search the library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {visibleBooks.length === 0 ? (
          <div className="empty">
            <h3>{empty.title}</h3>
            <p>{empty.body}</p>
          </div>
        ) : (
          <div className="books">
            {visibleBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Library;
