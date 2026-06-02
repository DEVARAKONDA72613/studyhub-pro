import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import { books } from "../data/books";

function BookDetails() {
  const { id } = useParams();

  const book = books.find(
    (b) => b.id === Number(id)
  );

  if (!book) {
    return (
      <>
        <Navbar />
        <div
          style={{
            padding: "40px",
          }}
        >
          <h1>Book Not Found</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        <BookCard book={book} />
      </div>
    </>
  );
}

export default BookDetails;