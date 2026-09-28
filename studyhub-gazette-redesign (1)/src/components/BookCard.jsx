import { useEffect, useState } from "react";

function BookCard({ book }) {
  const [views, setViews] = useState(book.views || 0);
  const [downloads, setDownloads] = useState(book.downloads || 0);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const savedViews = Number(localStorage.getItem(`views-${book.id}`)) || book.views || 0;
    const savedDownloads =
      Number(localStorage.getItem(`downloads-${book.id}`)) || book.downloads || 0;
    const savedProgress = Number(localStorage.getItem(`progress-${book.id}`)) || 0;
    const savedRating = Number(localStorage.getItem(`rating-${book.id}`)) || 0;
    const library = JSON.parse(localStorage.getItem("library")) || [];

    setViews(savedViews);
    setDownloads(savedDownloads);
    setProgress(savedProgress);
    setSaved(library.includes(book.id));
    setUserRating(savedRating);
  }, [book.id, book.views, book.downloads]);

  const handleView = () => {
    const newViews = views + 1;
    const newProgress = Math.min(progress + 10, 100);

    localStorage.setItem(`views-${book.id}`, newViews);
    localStorage.setItem(`progress-${book.id}`, newProgress);
    setViews(newViews);
    setProgress(newProgress);

    if (book.viewLink) window.open(book.viewLink, "_blank");
  };

  const handleDownload = () => {
    const newDownloads = downloads + 1;
    localStorage.setItem(`downloads-${book.id}`, newDownloads);
    setDownloads(newDownloads);

    if (book.downloadLink) window.open(book.downloadLink, "_blank");
  };

  const handleSave = () => {
    const library = JSON.parse(localStorage.getItem("library")) || [];

    if (library.includes(book.id)) {
      localStorage.setItem("library", JSON.stringify(library.filter((id) => id !== book.id)));
      setSaved(false);
    } else {
      library.push(book.id);
      localStorage.setItem("library", JSON.stringify(library));
      setSaved(true);
    }
  };

  const handleRating = (rating) => {
    localStorage.setItem(`rating-${book.id}`, rating);
    setUserRating(rating);
  };

  return (
    <article className="book">
      <div className="book-top">
        <div className="book-ico" style={{ background: book.color }} aria-hidden="true">
          {book.icon}
        </div>
        <span className="badge">{book.category}</span>
      </div>

      <h3>{book.title}</h3>

      <div className="book-stats mono">
        <span>★ {book.rating}</span>
        <span>{views.toLocaleString()} views</span>
        <span>{downloads.toLocaleString()} downloads</span>
      </div>

      <div className="btnrow">
        <button className="btn btn-sm" onClick={handleView}>
          View
        </button>
        <button className="btn btn-alt btn-sm" onClick={handleDownload}>
          Download
        </button>
        <button
          className={saved ? "btn btn-ok btn-sm" : "btn btn-alt btn-sm"}
          onClick={handleSave}
          aria-pressed={saved}
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <div>
        <p className="mono small muted" style={{ marginBottom: 4 }}>
          YOUR RATING{userRating > 0 ? ` · ${userRating}/5` : ""}
        </p>
        <div className="stars" role="group" aria-label="Your rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={star <= userRating ? "on" : ""}
              onClick={() => handleRating(star)}
              aria-label={`Rate ${star} out of 5`}
              aria-pressed={star <= userRating}
            >
              {star <= userRating ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div
          className="mono small muted"
          style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}
        >
          <span>CONTINUE READING</span>
          <span>{progress}%</span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      {book.recommended && book.recommended.length > 0 && (
        <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 12 }}>
          <p className="mono small muted">RECOMMENDED NEXT</p>
          <ul>
            {book.recommended.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default BookCard;
