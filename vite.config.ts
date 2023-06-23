import { defineConfig } from "vite";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";

import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), chunkSplitPlugin()],
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
        find: "@/api-lib",
        replacement: path.resolve(__dirname, "api-lib"),
      },
      {
        find: "@/Music",
        replacement: path.resolve(__dirname, "src", "Music"),
      },
    ],
  },
});
