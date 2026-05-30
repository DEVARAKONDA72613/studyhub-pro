function StatsCard({ title, value, icon }) {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        color: "var(--text)",
        padding: "24px",
        borderRadius: "20px",
        border: "1px solid var(--border)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        transition: "0.3s ease",
      }}
    >
      <div
        style={{
          fontSize: "30px",
          marginBottom: "10px",
        }}
      >
        {icon}
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: "28px",
          color: "var(--text)",
        }}
      >
        {value}
      </h2>

      <p
        style={{
          marginTop: "8px",
          opacity: "0.75",
          color: "var(--text)",
        }}
      >
        {title}
      </p>
    </div>
  );
}

export default StatsCard;