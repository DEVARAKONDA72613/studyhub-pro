function CategoryFilter({ categories, selected, setSelected }) {
  return (
    <div className="chips" style={{ marginBottom: 30 }}>
      {categories.map((category) => (
        <button
          key={category}
          className="chip"
          aria-pressed={selected === category}
          onClick={() => setSelected(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
