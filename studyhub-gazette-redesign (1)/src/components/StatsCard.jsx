function StatsCard({ title, value }) {
  return (
    <div className="stat">
      <div className="v">{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="k mono">{title}</div>
    </div>
  );
}

export default StatsCard;
