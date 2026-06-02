import { useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import StatsCard from "../components/StatsCard";
import PopularCategories from "../components/PopularCategories";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";

import { books } from "../data/books";

function Home() {
  const [search, setSearch] =
    useState("");

  const categories = [
    ...new Set(
      books.map(
        (book) => book.category
      )
    ),
  ];

  const totalDownloads =
    books.reduce(
      (sum, book) =>
        sum + book.downloads,
      0
    );

  const trendingTags = [
    "DSA",
    "DBMS",
    "Java",
    "Web Development",
    "OOP",
  ];

  const filteredBooks =
    books.filter(
      (book) =>
        book.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        book.category
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <>
      <Navbar />

      <Hero />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      {search.trim() ===
      "" ? (
        <>
          <section
            style={{
              maxWidth:
                "1200px",
              margin:
                "40px auto",
              padding:
                "0 20px",
            }}
          >
            <h2
              style={{
                color:
                  "var(--text)",
                marginBottom:
                  "16px",
              }}
            >
              🔥 Trending Searches
            </h2>

            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap: "12px",
              }}
            >
              {trendingTags.map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSearch(
                        tag
                      )
                    }
                    style={{
                      padding:
                        "10px 18px",
                      borderRadius:
                        "999px",
                      border:
                        "1px solid var(--border)",
                      background:
                        "var(--card-bg)",
                      color:
                        "var(--text)",
                      cursor:
                        "pointer",
                      fontWeight:
                        "600",
                    }}
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </section>

          <PopularCategories />

          <section
            style={{
              maxWidth:
                "1200px",
              margin:
                "60px auto",
              padding:
                "0 20px",
            }}
          >
            <h2
              style={{
                color:
                  "var(--text)",
                marginBottom:
                  "20px",
              }}
            >
              📈 Platform Stats
            </h2>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: "20px",
              }}
            >
              <StatsCard
                title="Total Notes"
                value={
                  books.length
                }
                icon="📚"
              />

              <StatsCard
                title="Categories"
                value={
                  categories.length
                }
                icon="📂"
              />

              <StatsCard
                title="Downloads"
                value={
                  totalDownloads
                }
                icon="⬇️"
              />

              <StatsCard
                title="Highest Rated"
                value="5.0"
                icon="⭐"
              />
            </div>
          </section>
        </>
      ) : (
        <section
          style={{
            maxWidth:
              "1200px",
            margin:
              "40px auto",
            padding:
              "0 20px",
          }}
        >
          <h2
            style={{
              color:
                "var(--text)",
              marginBottom:
                "20px",
            }}
          >
            🔍 Search Results
          </h2>

          {filteredBooks.length ===
          0 ? (
            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "50px",
              }}
            >
              <h3>
                No notes found
              </h3>

              <p>
                Try another
                keyword.
              </p>
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(280px,1fr))",
                gap: "20px",
              }}
            >
              {filteredBooks.map(
                (book) => (
                  <BookCard
                    key={
                      book.id
                    }
                    book={
                      book
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      )}

      <Footer />
    </>
  );
}

export default Home;