import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  return {
    plugins: [vue()],
    server: isDev
      ? {
          proxy: {
            "/api": {
              target: "http://localhost:3000",
              changeOrigin: true
            }
          }
        }
      : undefined
  };
});

