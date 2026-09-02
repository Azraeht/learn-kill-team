import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves this as a project page at /learn-kill-team/.
// Override with BASE_URL for other hosting targets (defaults to '/').
const base = process.env.BASE_URL ?? "/learn-kill-team/";

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Kill Team Trainer",
        short_name: "KT Trainer",
        description: "Une application de quiz gamifiée et utilisable hors ligne pour apprendre les règles de Warhammer 40,000 Kill Team.",
        lang: "fr",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#0f1115",
        theme_color: "#0f1115",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json}"],
      },
    }),
  ],
});
