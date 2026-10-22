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
    modulePreload: {
      polyfill: false,
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        // Only preload critical dependencies for initial home page
        // Exclude heavy lazy-only libraries (motion, lightbox) and admin chunks
        return deps.filter(
          (dep) =>
            !dep.includes('motion') &&
            !dep.includes('lightbox') &&
            !dep.includes('Manager') &&
            !dep.includes('Admin')
        )
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            if (id.includes('swiper')) {
              return 'vendor-swiper'
            }
            if (id.includes('yet-another-react-lightbox')) {
              return 'vendor-lightbox'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
          }
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
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
