/* eslint-disable import/no-default-export */
import react from "@vitejs/plugin-react";
import bodyParser from "body-parser";
import path from "path";
import type { PluginOption } from "vite";
import { defineConfig, loadEnv } from "vite";
import { apiServer } from "vite-api-server";

export default ({ mode }) => {
  if (process.env.VERCEL_ENV === undefined) {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };
  }

  const environment = process.env.VITE_VERCEL_ENV ?? process.env.VERCEL_ENV;
  const plugins: PluginOption[] = [react()];
  if (environment === "development" && mode === "development") {
    plugins.push(
      apiServer({
        handler: "api-local/server.ts",
        middleware: [bodyParser.json()],
      })
    );
  }
  return defineConfig({
    plugins,
    define: {
      __APP_ENV__: JSON.stringify(environment),
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
          find: "@/config",
          replacement: path.resolve(__dirname, "config"),
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
              if (id.includes("dnd-kit")) {
                return "dnd-kit-vendor";
              }
              return "vendor";
            }
          },
        },
      },
    },
  });
};
