import { FiBookOpen } from "react-icons/fi";

function Navbar() {
  return (
    <nav
      style={{
        padding: "20px 40px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <FiBookOpen size={24} />
          <h2>StudyHub Pro</h2>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          <span>Home</span>
          <span>Library</span>
          <span>Categories</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
