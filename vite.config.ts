import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_ENV__: JSON.stringify(
      process.env.VITE_VERCEL_ENV ?? process.env.VERCEL_ENV
    ),
  },
  resolve: {
    alias: [
      {
        find: "@/src",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: "@/lib",
        replacement: path.resolve(__dirname, "lib"),
      },
      {
        find: "@/Music",
        replacement: path.resolve(__dirname, "src", "Music"),
      },
    ],
  },
});
