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
        find: "@/api-lib",
        replacement: path.resolve(__dirname, "api-lib"),
      },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (
            id.includes("node_modules") &&
            id.match(/\.(css|scss|sass|less)$/) === null
          ) {
            if (id.includes("lucide")) {
              return "lucide-vendor";
            } else if (id.includes("ably")) {
              return "ably-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
});
