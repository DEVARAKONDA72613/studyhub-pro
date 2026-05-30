function BookCard({ book }) {
  return (
    <div
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-8px)";
        e.currentTarget.style.boxShadow =
          "0 20px 40px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.05)";
      }}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        padding: "24px",
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "70px",
          height: "70px",
          background: book.color,
          borderRadius: "18px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "34px",
          marginBottom: "15px",
        }}
      >
        {book.icon}
      </div>

      <h3
        style={{
          marginBottom: "10px",
          color: "var(--text)",
          fontSize: "22px",
        }}
      >
        {book.title}
      </h3>

      <span
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid var(--border)",
          padding: "6px 12px",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: "600",
          display: "inline-block",
          marginBottom: "15px",
          color: "var(--text)",
        }}
      >
        {book.category}
      </span>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          fontSize: "14px",
          color: "var(--text)",
          opacity: 0.85,
        }}
      >
        <span>⭐ {book.rating}</span>
        <span>⬇️ {book.downloads}</span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <button
          onClick={() => {
            if (book.viewLink) {
              window.open(book.viewLink, "_blank");
            }
          }}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          View
        </button>

        <button
          onClick={() => {
            if (book.downloadLink) {
              window.open(
                book.downloadLink,
                "_blank"
              );
            }
          }}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--card-bg)",
            color: "var(--text)",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Download
        </button>
      </div>

      {book.recommended &&
        book.recommended.length > 0 && (
          <div
            style={{
              borderTop:
                "1px solid var(--border)",
              paddingTop: "15px",
            }}
          >
            <p
              style={{
                margin: "0 0 10px 0",
                color: "var(--text)",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              📚 Recommended Next
            </p>

            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                color: "var(--text)",
                opacity: 0.8,
                fontSize: "13px",
              }}
            >
              {book.recommended.map(
                (item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
    </div>
  );
}

export default BookCard;