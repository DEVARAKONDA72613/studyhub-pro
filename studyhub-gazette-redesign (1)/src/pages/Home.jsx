import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import RoomTicker from "../components/RoomTicker";
import SearchBar from "../components/SearchBar";
import StatsCard from "../components/StatsCard";
import PopularCategories from "../components/PopularCategories";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";
import { subscribeToPublicRooms } from "../utils/firestoreRooms";
import { books } from "../data/books";

const trendingTags = ["DSA", "DBMS", "Java", "Web Development", "OOP"];

function Home() {
  const { user, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);

  // One shared subscription feeds both the ticker and the hero's featured room.
  useEffect(() => {
    if (loading || !user) {
      setRooms([]);
      return;
    }
    const unsubscribe = subscribeToPublicRooms(setRooms);
    return () => unsubscribe();
  }, [user, loading]);

  const categories = [...new Set(books.map((book) => book.category))];
  const totalDownloads = books.reduce((sum, book) => sum + book.downloads, 0);

  const query = search.trim().toLowerCase();
  const filteredBooks = books.filter(
    (book) => book.title.toLowerCase().includes(query) || book.category.toLowerCase().includes(query)
  );

  return (
    <>
      <Navbar />
      <RoomTicker rooms={rooms} user={user} />

      <main id="main-content" className="wrap page">
        <Hero rooms={rooms} user={user} />

        <SearchBar search={search} setSearch={setSearch} />

        {query === "" ? (
          <>
            <div className="sec">
              <span className="sec-n mono">§ 01</span>
              <h2>Trending searches</h2>
            </div>
            <div className="chips">
              {trendingTags.map((tag) => (
                <button key={tag} className="chip" onClick={() => setSearch(tag)}>
                  {tag}
                </button>
              ))}
            </div>

            <div className="sec">
              <span className="sec-n mono">§ 02</span>
              <h2>The library</h2>
            </div>
            <PopularCategories />

            <div className="sec">
              <span className="sec-n mono">§ 03</span>
              <h2>By the numbers</h2>
            </div>
            <div className="stats">
              <StatsCard title="TOTAL NOTES" value={books.length} />
              <StatsCard title="CATEGORIES" value={categories.length} />
              <StatsCard title="DOWNLOADS" value={totalDownloads} />
              <StatsCard title="HIGHEST RATED" value="5.0" />
            </div>
          </>
        ) : (
          <>
            <div className="sec">
              <span className="sec-n mono">§</span>
              <h2>Search results</h2>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="empty">
                <h3>No notes found</h3>
                <p>Try another keyword.</p>
              </div>
            ) : (
              <div className="books">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Home;
