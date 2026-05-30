function SearchBar({ search, setSearch }) {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          position: "relative",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: "18px 20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            background: "var(--card-bg)",
            color: "var(--text)",
            fontSize: "16px",
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar;