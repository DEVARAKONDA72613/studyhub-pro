import { useNavigate } from "react-router-dom";
import { books } from "../data/books";

function SearchBar({
  search,
  setSearch,
}) {
  const navigate =
    useNavigate();

  const suggestions =
    search.trim() === ""
      ? []
      : books
          .filter(
            (book) =>
              book.title
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          )
          .slice(0, 5);

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

        {suggestions.length >
          0 && (
          <div
            style={{
              position:
                "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop:
                "8px",
              background:
                "var(--card-bg)",
              border:
                "1px solid var(--border)",
              borderRadius:
                "16px",
              overflow:
                "hidden",
              zIndex: 999,
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            {suggestions.map(
              (book) => (
                <div
                  key={book.id}
                  onClick={() =>
                    navigate(
                      `/book/${book.id}`
                    )
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "12px",
                    padding:
                      "14px 18px",
                    cursor:
                      "pointer",
                    borderBottom:
                      "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        "22px",
                    }}
                  >
                    {book.icon}
                  </span>

                  <div>
                    <div
                      style={{
                        fontWeight:
                          "600",
                        color:
                          "var(--text)",
                      }}
                    >
                      {
                        book.title
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          "12px",
                        opacity:
                          0.7,
                      }}
                    >
                      {
                        book.category
                      }
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;