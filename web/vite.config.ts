import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// The dev server forwards /feedback to the API, so the browser sees one origin and no CORS is needed.
// The aliases point at the API contract, the single source of truth shared with the backend.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@contract": fromRoot("../src/contract.ts"),
      "@limits": fromRoot("../src/limits.ts"),
    },
  },
  server: { proxy: { "/feedback": "http://localhost:3000" } },
});
