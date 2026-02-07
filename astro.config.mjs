import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";

// En dev usamos Node (evita plugin que provoca __DEFINES__ y MIME type errors).
// En producción: Cloudflare Pages.
const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  output: "server",
  adapter: isProd ? cloudflare() : node({ mode: "standalone" }),
  vite: {
    plugins: [tailwind()],
  },
  image: {
    domains: ["billingbearpark.com", "images.pexels.com"],
  },
  integrations: [react()],
});