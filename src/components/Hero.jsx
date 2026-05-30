import { motion } from "framer-motion";

function Hero() {
  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "80px 20px",
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: "3rem",
          lineHeight: "1.1",
          fontWeight: "bold",
        }}
      >
        Study Smarter.
        <br />
        Not Harder.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: "1.2rem",
          color: "var(--text)",
          opacity: 0.8,
          maxWidth: "600px",
        }}
      >
        Access notes, organize resources, and build your
        personal learning hub.
      </motion.p>
    </section>
  );
}

export default Hero;