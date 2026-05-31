import { useEffect, useState } from "react";
import { books } from "../data/books";
import BookCard from "../components/BookCard";
import Navbar from "../components/Navbar";

function Library() {
  const [savedBooks, setSavedBooks] =
    useState([]);

  useEffect(() => {
    const library =
      JSON.parse(
        localStorage.getItem(
          "library"
        )
      ) || [];

    const filteredBooks =
      books.filter((book) =>
        library.includes(book.id)
      );

    setSavedBooks(filteredBooks);
  }, []);

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
          📚 My Library
        </h1>

        <p
          style={{
            opacity: 0.7,
            marginBottom: "30px",
          }}
        >
          Your saved notes appear here.
        </p>

        {savedBooks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <h2>
              No saved notes yet
            </h2>

            <p>
              Save notes from the
              homepage to build your
              personal library.
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
            {savedBooks.map(
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

export default Library;