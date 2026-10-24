import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // `vite dev` serves no /api — those are Vercel functions — so locally the
    // contribution graph fell back to a third-party proxy that sees public
    // activity only and trails GitHub by days. In dev it showed a graph that
    // stopped in August while the real one (and the deployed site) did not.
    // Read-only routes only: forwarding /api/visit or /api/collect would mail
    // an alert, and count a visit, for every local page load.
    proxy: {
      "/api/contributions": { target: "https://www.bhupesh.blog", changeOrigin: true },
      "/api/stats": { target: "https://www.bhupesh.blog", changeOrigin: true },
      "/api/github-activity": { target: "https://www.bhupesh.blog", changeOrigin: true },
    },
  },
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
