import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import { books } from "../data/books";

function BookDetails() {
  const { id } = useParams();
  const book = books.find((b) => b.id === Number(id));

  return (
    <>
      <Navbar />

      <main id="main-content" className="wrap page" style={{ maxWidth: 820 }}>
        <div style={{ padding: "40px 0 24px" }}>
          <Link to="/library" className="back mono">
            ← Back to the library
          </Link>
        </div>

        {book ? (
          <BookCard book={book} />
        ) : (
          <div className="empty">
            <h3>Note not found</h3>
            <p>That note doesn't exist or was removed.</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default BookDetails;
