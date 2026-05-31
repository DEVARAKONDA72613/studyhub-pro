import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

function Hero() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => unsubscribe();
  }, []);

  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "80px 20px",
      }}
    >
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginBottom: "25px",
            padding: "18px",
            borderRadius: "16px",
            background:
              "linear-gradient(135deg,#4f46e5,#7c3aed)",
            color: "white",
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            Welcome back,
            {" "}
            {user.displayName?.split(" ")[0]}
            👋
          </h2>

          <p
            style={{
              marginTop: "8px",
              opacity: 0.9,
            }}
          >
            Ready to continue your learning journey?
          </p>
        </motion.div>
      )}

      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
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
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.3,
        }}
        style={{
          fontSize: "1.2rem",
          color: "var(--text)",
          opacity: 0.8,
          maxWidth: "600px",
        }}
      >
        Access notes, organize resources,
        and build your personal learning hub.
      </motion.p>
    </section>
  );
}

export default Hero;