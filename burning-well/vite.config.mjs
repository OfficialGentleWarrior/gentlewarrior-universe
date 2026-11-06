import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(
  new URL(".", import.meta.url)
);

export default defineConfig({
  // LOCAL EVENTS API PROXY
  server: {
    proxy: {
      '/local-events-api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/local-events-api/, '/gentle-warrior/asia-southeast1/burningWellApi'),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(
          rootDir,
          "index.html"
        ),
        createEvent: resolve(rootDir, 'create-event/index.html'),
        publicEvent: resolve(rootDir, 'event/index.html'),
        admin: resolve(
          rootDir,
          "admin/index.html"
        ),
      },
    },
  },
});