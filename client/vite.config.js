import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Plugin tự động dọn dẹp thư mục public/assets cũ trước mỗi lần build (giữ nguyên public/uploads)
function cleanAssetsPlugin() {
  return {
    name: "clean-assets-plugin",
    buildStart() {
      const assetsDir = path.resolve(__dirname, "../public/assets");
      if (fs.existsSync(assetsDir)) {
        try {
          fs.rmSync(assetsDir, { recursive: true, force: true });
        } catch (e) {
          // Bỏ qua lỗi nếu thư mục đang được process khác lock nhẹ
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), cleanAssetsPlugin()],
  build: {
    outDir: "../public",
    emptyOutDir: false, // Không xóa toàn bộ public để bảo toàn uploads/
    target: "es2020",
    cssCodeSplit: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-swiper": ["swiper"],
          "vendor-icons": ["lucide-react"],
          "vendor-lightbox": ["yet-another-react-lightbox"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
