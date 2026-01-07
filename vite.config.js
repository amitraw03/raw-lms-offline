import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // ✅ ensures app works offline after first load
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },

      // ✅ assets cached for offline
      includeAssets: [
        "favicon.svg",
        "pwa-192x192.png",
        "pwa-512x512.png"
      ],

      manifest: {
        name: "RAW-LMS",
        short_name: "RAW-LMS",
        description: "Pure Offline Library Management System",

        theme_color: "#121212",
        background_color: "#121212",

        display: "standalone",

        // 🔑 IMPORTANT FOR OFFLINE
        start_url: ".",
        scope: ".",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose:"any"
          }
        ]
      },

      // ✅ allows PWA install in dev (optional but useful)
      devOptions: {
        enabled: true
      }
    })
  ]
});
