function SearchBar({
  search,
  setSearch,
}) {
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
          placeholder="🔍 Search notes, subjects, topics..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding:
              "20px 22px",
            borderRadius:
              "18px",
            border:
              "1px solid var(--border)",
            background:
              "var(--card-bg)",
            color:
              "var(--text)",
            fontSize: "16px",
            outline: "none",
            boxSizing:
              "border-box",
            transition:
              "all 0.3s ease",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.05)",
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar;