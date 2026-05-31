import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";

import { books } from "../data/books";

function Category() {
  const { name } = useParams();

  const filteredBooks =
    books.filter(
      (book) =>
        book.category === name
    );

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <h1>
          📂 {name}
        </h1>

        <p
          style={{
            opacity: 0.7,
            marginBottom: "30px",
          }}
        >
          Browse notes from the{" "}
          {name} category.
        </p>

        {filteredBooks.length ===
        0 ? (
          <div
            style={{
              textAlign:
                "center",
              padding: "60px",
            }}
          >
            <h2>
              No notes found
            </h2>

            <p>
              Notes for this
              category will
              appear here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "20px",
            }}
          >
            {filteredBooks.map(
              (book) => (
                <BookCard
                  key={book.id}
                  book={book}
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Category;