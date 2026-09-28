import { useNavigate } from "react-router-dom";
import { books } from "../data/books";

function SearchBar({ search, setSearch }) {
  const navigate = useNavigate();

  const suggestions =
    search.trim() === ""
      ? []
      : books.filter((book) => book.title.toLowerCase().includes(search.toLowerCase())).slice(0, 5);

  return (
    <div className="relative">
      <label htmlFor="home-search" className="sr-only">
        Search notes, subjects and topics
      </label>
      <input
        id="home-search"
        className="input big"
        type="text"
        placeholder="Search notes, subjects, topics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {suggestions.length > 0 && (
        <div className="suggest">
          {suggestions.map((book) => (
            <button key={book.id} type="button" onClick={() => navigate(`/book/${book.id}`)}>
              <span style={{ fontSize: 22 }} aria-hidden="true">
                {book.icon}
              </span>
              <span>
                <span style={{ display: "block", fontWeight: 600 }}>{book.title}</span>
                <span className="small" style={{ opacity: 0.7 }}>
                  {book.category}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
