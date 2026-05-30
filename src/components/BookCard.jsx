function BookCard({ book }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          background: book.color,
          borderRadius: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "30px",
        }}
      >
        {book.icon}
      </div>

      <h3>{book.title}</h3>

      <p>{book.category}</p>

      <p>
        ⭐ {book.rating} | ⬇️ {book.downloads}
      </p>

      <button
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "12px",
          border: "none",
          background: "#111827",
          color: "white",
        }}
      >
        Open Notes
      </button>
    </div>
  );
}

export default BookCard;