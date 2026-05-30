import { useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import BookCard from "../components/BookCard";
import StatsCard from "../components/StatsCard";
import CategoryFilter from "../components/CategoryFilter";

import { books } from "../data/books";

function Home() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All");

  const categories = [
    "All",
    ...new Set(
      books.map((book) => book.category)
    ),
  ];

  const totalDownloads =
    books.reduce(
      (sum, book) =>
        sum + book.downloads,
      0
    );

  const filteredBooks = books.filter(
    (book) => {
      const matchesSearch =
        book.title
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selected === "All" ||
        book.category === selected;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  return (
    <>
      <Navbar />

      <Hero />

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <StatsCard
            title="Total Notes"
            value={books.length}
            icon="📚"
          />

          <StatsCard
            title="Categories"
            value={categories.length - 1}
            icon="📂"
          />

          <StatsCard
            title="Downloads"
            value={totalDownloads}
            icon="⬇️"
          />

          <StatsCard
            title="Top Rated"
            value="5.0"
            icon="⭐"
          />
        </div>
      </section>

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "20px auto",
          padding: "0 20px",
        }}
      >
        <CategoryFilter
          categories={categories}
          selected={selected}
          setSelected={setSelected}
        />
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px",
          padding: "20px",
        }}
      >
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
          />
        ))}
      </div>
    </>
  );
}

export default Home;