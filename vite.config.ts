import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Travel Journal",
        short_name: "Journal",
        description: "A map of everywhere you've been, city by city.",
        theme_color: "#c67139",
        background_color: "#f5ead8",
        display: "standalone",
        orientation: "portrait",
        // SVG for now — add PNG 192/512 + a 180x180 apple-touch-icon.png in
        // public/ for the best install experience (see README).
        icons: [
          { src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      workbox: {
        // world-atlas topojson is large + immutable — cache it hard.
        runtimeCaching: [
          {
            urlPattern: /world-atlas|countries-110m/,
            handler: "CacheFirst",
            options: { cacheName: "geo", expiration: { maxEntries: 4 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@core": fileURLToPath(new URL("./src/core", import.meta.url)),
      "@ui": fileURLToPath(new URL("./src/ui", import.meta.url)),
      "@theme": fileURLToPath(new URL("./src/theme", import.meta.url)),
    },
  },
  server: { host: true }, // expose on LAN so you can open it on your iPhone
});
