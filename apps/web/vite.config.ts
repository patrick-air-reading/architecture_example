import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In dev the API runs separately; in Docker, nginx does this proxying instead.
    proxy: { "/api": process.env.API_URL ?? "http://localhost:4000" },
  },
});
