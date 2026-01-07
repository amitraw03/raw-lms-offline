import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/raw-lms-offline/", // 🔑 VERY IMPORTANT
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      scope: "/raw-lms-offline/",
      base: "/raw-lms-offline/",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "raw-LMS",
        short_name: "raw-LMS",
        description: "Offline Library Management System",
        theme_color: "#121212",
        background_color: "#121212",
        display: "standalone",
        start_url: "/raw-lms-offline/",
        icons: [
          {
            src: "/raw-lms-offline/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/raw-lms-offline/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});
