import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@management": resolve(__dirname, "../Management/src"),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        unsafe: false,
      },
      mangle: {
        reserved: ['generateManagementPDF', 'generateAndDownloadPDF'],
      },
    },
  },
  server: {
    open: true,
    proxy: {
      // "/api": "http://localhost:5001/api",
    },
    fs: {
      allow: [resolve(__dirname, "..")],
    },
    hmr: {
      overlay: false,
    },
  },
});
