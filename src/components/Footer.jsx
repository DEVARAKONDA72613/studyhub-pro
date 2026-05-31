function Footer() {
  return (
    <footer
      style={{
        marginTop: "80px",
        borderTop:
          "1px solid var(--border)",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent:
            "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <h3
            style={{
              marginBottom: "8px",
            }}
          >
            📚 StudyHub Pro
          </h3>

          <p
            style={{
              opacity: 0.7,
            }}
          >
            Learn Smarter.
            Not Harder.
          </p>
        </div>

        <div>
          <p>
            Built with React +
            Firebase
          </p>

          <p
            style={{
              opacity: 0.7,
            }}
          >
            © 2026 StudyHub Pro
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;