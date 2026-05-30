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
        Your Digital
        <br />
        Knowledge Space
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: "1.2rem",
          color: "#6b7280",
          maxWidth: "600px",
        }}
      >
        Store, search and organize your academic
        resources in a clean Notion-inspired library.
      </motion.p>
    </section>
  );
}

export default Hero;