import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The dev server forwards /feedback to the API, so the browser sees one origin and no CORS is needed.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/feedback": "http://localhost:3000" } },
});
