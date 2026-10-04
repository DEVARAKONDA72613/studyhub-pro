import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],

  build: {
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("firebase") || id.includes("@firebase")) {
            return "firebase";
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (id.includes("react-icons")) {
            return "icons";
          }

          if (
            id.includes("react-markdown") ||
            id.includes("remark-gfm") ||
            id.includes("unified") ||
            id.includes("micromark") ||
            id.includes("mdast")
          ) {
            return;
          }

          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router")
          ) {
            return "react";
          }

          return "vendor";
        },
      },
    },
  },
});