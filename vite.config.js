import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  build: { sourcemap: false, rolldownOptions: { output: { minify: mode === "production" ? { compress: { dropConsole: true, dropDebugger: true } } : false } } },
}));
