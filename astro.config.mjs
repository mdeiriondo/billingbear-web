import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import node from "@astrojs/node";

// En dev usamos Node (evita plugin Netlify que provoca __DEFINES__ y MIME type errors).
// En build/producción usamos Netlify para el deploy.
const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  output: "server",
  adapter: isProd ? netlify({ mode: "standalone" }) : node({ mode: "standalone" }),
  vite: {
    plugins: [tailwind()],
  },
  image: {
    domains: ["billingbearpark.com", "images.pexels.com"],
  },
  integrations: [react()],
});