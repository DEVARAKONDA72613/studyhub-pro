import { useEffect, useState } from "react";

function BookCard({ book }) {
  const [views, setViews] = useState(
    book.views || 0
  );

  const [downloads, setDownloads] =
    useState(
      book.downloads || 0
    );

  const [progress, setProgress] =
    useState(0);

  useEffect(() => {
    const savedViews =
      Number(
        localStorage.getItem(
          `views-${book.id}`
        )
      ) || book.views || 0;

    const savedDownloads =
      Number(
        localStorage.getItem(
          `downloads-${book.id}`
        )
      ) || book.downloads || 0;

    const savedProgress =
      Number(
        localStorage.getItem(
          `progress-${book.id}`
        )
      ) || 0;

    setViews(savedViews);
    setDownloads(savedDownloads);
    setProgress(savedProgress);
  }, [book.id]);

  const handleView = () => {
    const newViews = views + 1;

    const newProgress =
      Math.min(
        progress + 10,
        100
      );

    localStorage.setItem(
      `views-${book.id}`,
      newViews
    );

    localStorage.setItem(
      `progress-${book.id}`,
      newProgress
    );

    setViews(newViews);
    setProgress(newProgress);

    if (book.viewLink) {
      window.open(
        book.viewLink,
        "_blank"
      );
    }
  };

  const handleDownload = () => {
    const newDownloads =
      downloads + 1;

    localStorage.setItem(
      `downloads-${book.id}`,
      newDownloads
    );

    setDownloads(newDownloads);

    if (book.downloadLink) {
      window.open(
        book.downloadLink,
        "_blank"
      );
    }
  };

  return (
    <div
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-8px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";
      }}
      style={{
        background:
          "var(--card-bg)",
        border:
          "1px solid var(--border)",
        borderRadius: "24px",
        padding: "24px",
        transition: "0.3s",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "70px",
          height: "70px",
          background:
            book.color,
          borderRadius: "18px",
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          fontSize: "34px",
          marginBottom:
            "15px",
        }}
      >
        {book.icon}
      </div>

      <h3
        style={{
          marginBottom: "10px",
          color: "var(--text)",
        }}
      >
        {book.title}
      </h3>

      <span
        style={{
          background:
            "rgba(255,255,255,0.08)",
          border:
            "1px solid var(--border)",
          padding: "6px 12px",
          borderRadius: "999px",
          fontSize: "13px",
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
          justifyContent:
            "space-between",
          marginBottom: "20px",
          color: "var(--text)",
        }}
      >
        <span>
          ⭐ {book.rating}
        </span>

        <span>
          👁️ {views}
        </span>

        <span>
          ⬇️ {downloads}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <button
          onClick={handleView}
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
          onClick={
            handleDownload
          }
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border:
              "1px solid var(--border)",
            background:
              "var(--card-bg)",
            color:
              "var(--text)",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Download
        </button>
      </div>

      <div
        style={{
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginBottom: "6px",
            color:
              "var(--text)",
          }}
        >
          <span>
            Continue Reading
          </span>

          <span>
            {progress}%
          </span>
        </div>

        <div
          style={{
            height: "8px",
            background:
              "rgba(255,255,255,0.08)",
            borderRadius:
              "999px",
            overflow:
              "hidden",
          }}
        >
          <div
            style={{
              width:
                `${progress}%`,
              height: "100%",
              background:
                "linear-gradient(90deg,#6366f1,#8b5cf6)",
            }}
          />
        </div>
      </div>

      {book.recommended &&
        book.recommended.length >
          0 && (
          <div
            style={{
              borderTop:
                "1px solid var(--border)",
              paddingTop:
                "15px",
              color:
                "var(--text)",
            }}
          >
            <p>
              📚 Recommended Next
            </p>

            <ul>
              {book.recommended.map(
                (
                  item,
                  index
                ) => (
                  <li
                    key={
                      index
                    }
                  >
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