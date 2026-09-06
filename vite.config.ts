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
      // We register the service worker ourselves in main.ts so we can reload
      // the page once a new version takes over — see the comment there for why.
      injectRegister: false,
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Kill Team Trainer",
        short_name: "KT Trainer",
        description: "Une application de quiz gamifiée et utilisable hors ligne pour apprendre les règles de Warhammer 40,000 Kill Team.",
        lang: "fr",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#020e08",
        theme_color: "#020e08",
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
        // Explicit rather than inferred from registerType: with injectRegister
        // disabled (we register the SW ourselves, see registerServiceWorker.ts),
        // vite-plugin-pwa otherwise drops clientsClaim() and switches skipWaiting
        // to a postMessage handshake we'd never trigger, leaving an open tab
        // uncontrolled by any new service worker until a hard refresh.
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,svg,png,json}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
