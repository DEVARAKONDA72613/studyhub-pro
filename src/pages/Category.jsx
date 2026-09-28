import { useParams, Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";

import { books } from "../data/books";

function Category() {
  const { name } = useParams();
  const filteredBooks = books.filter((book) => book.category === name);

  return (
    <>
      <Navbar />

      <main id="main-content" className="wrap page">
        <div style={{ padding: "40px 0 28px" }}>
          <Link to="/library" className="back mono">
            ← Back to the library
          </Link>
          <h1 style={{ fontSize: "clamp(34px,5.5vw,60px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {name}
          </h1>
          <p className="muted mono small" style={{ marginTop: 12 }}>
            {filteredBooks.length} note{filteredBooks.length === 1 ? "" : "s"} in this category
          </p>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="empty">
            <h3>No notes found</h3>
            <p>Notes for this category will appear here.</p>
          </div>
        ) : (
          <div className="books">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Category;
