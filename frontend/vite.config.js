import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/legacy": "http://localhost:3001",
      "/emage": "http://localhost:3001",
      "/video": "http://localhost:3001",
      "/vendor": "http://localhost:3001",
      "/data.json": "http://localhost:3001"
    }
  }
});

