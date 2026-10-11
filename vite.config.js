import { defineConfig } from "vite";

export default defineConfig({
  // Assets are copied to the deployed site's root, preserving their folders.
  publicDir: "assets",
});
