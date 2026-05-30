function CategoryFilter({
  categories,
  selected,
  setSelected,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "30px",
      }}
    >
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelected(category)}
          style={{
            padding: "12px 18px",
            borderRadius: "14px",

            border:
              selected === category
                ? "1px solid #3b82f6"
                : "1px solid var(--border)",

            background:
              selected === category
                ? "#2563eb"
                : "var(--card-bg)",

            color: "var(--text)",

            cursor: "pointer",

            fontWeight: "600",

            transition: "all 0.25s ease",

            whiteSpace: "nowrap",
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;