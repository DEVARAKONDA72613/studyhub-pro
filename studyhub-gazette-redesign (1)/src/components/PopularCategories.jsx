import { Link } from "react-router-dom";
import { books } from "../data/books";

const categories = [
  { name: "DSA", color: "var(--sig)" },
  { name: "Programming Languages", color: "var(--hl)" },
  { name: "Web Development", color: "var(--ok)" },
  { name: "Database Systems", color: "var(--blue)" },
  { name: "Core Computer Science", color: "var(--ink2)" },
];

function PopularCategories() {
  return (
    <div className="cards">
      {categories.map(({ name, color }, index) => {
        const count = books.filter((b) => b.category === name).length;
        return (
          <Link key={name} to={`/category/${name}`} className="idx-card" style={{ "--c": color }}>
            <div className="num">{String(index + 1).padStart(2, "0")}</div>
            <b>{name}</b>
            <span className="mono">
              {count} note{count === 1 ? "" : "s"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default PopularCategories;
