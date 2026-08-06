import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        /**
         * Everything used to land in one 516KB file, so a visitor downloaded
         * the animation library, every icon and the whole app before anything
         * rendered — and any one-line copy change invalidated the lot.
         *
         * Split by how often each part changes: React and framer-motion are
         * pinned and cache for months, icons change when the skill list does,
         * app code changes constantly. Separate files mean editing a bullet
         * re-downloads the small chunk, not the vendor code with it.
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-icons")) return "icons";
          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils"))
            return "motion";
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler"))
            return "react";
        },
      },
    },
  },
});
