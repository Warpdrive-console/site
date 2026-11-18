import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  // Assets are copied to the deployed site's root, preserving their folders.
  publicDir: "assets",
  // three.js is its own lazy chunk, loaded only when the hero handheld mounts.
  build: { chunkSizeWarningLimit: 650 },
});
