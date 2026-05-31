import { Link } from "react-router-dom";

const categories = [
  {
    name: "DSA",
    icon: "🧠",
  },
  {
    name: "Programming Languages",
    icon: "💻",
  },
  {
    name: "Web Development",
    icon: "🌐",
  },
  {
    name: "Database Systems",
    icon: "🗄️",
  },
  {
    name: "Core Computer Science",
    icon: "⚙️",
  },
];

function PopularCategories() {
  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h2>
        🔥 Popular Categories
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        {categories.map(
          (category) => (
            <Link
              key={category.name}
              to={`/category/${category.name}`}
              style={{
                textDecoration:
                  "none",
                color:
                  "var(--text)",
              }}
            >
              <div
                style={{
                  background:
                    "var(--card-bg)",
                  border:
                    "1px solid var(--border)",
                  borderRadius:
                    "20px",
                  padding:
                    "24px",
                  textAlign:
                    "center",
                  cursor:
                    "pointer",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "40px",
                    marginBottom:
                      "10px",
                  }}
                >
                  {
                    category.icon
                  }
                </div>

                <h3>
                  {
                    category.name
                  }
                </h3>
              </div>
            </Link>
          )
        )}
      </div>
    </section>
  );
}

export default PopularCategories;