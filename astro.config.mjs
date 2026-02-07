import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";
import { messageChannelPolyfillPlugin } from "./scripts/messagechannel-polyfill-plugin.js";

// En dev usamos Node (evita plugin que provoca __DEFINES__ y MIME type errors).
// En producción: Cloudflare Pages.
const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  output: "server",
  adapter: isProd ? cloudflare() : node({ mode: "standalone" }),
  vite: {
    plugins: [tailwind(), ...(isProd ? [messageChannelPolyfillPlugin()] : [])],
    resolve: {
      alias:
        import.meta.env.PROD
          ? {
              "react-dom/server": "react-dom/server.edge",
              "react-dom/server.browser": "react-dom/server.edge",
            }
          : {},
    },
    ssr:
      import.meta.env.PROD
        ? {
            resolve: {
              conditions: ["workerd", "worker", "import", "module"],
            },
          }
        : {},
  },
  image: {
    domains: ["billingbearpark.com", "images.pexels.com"],
  },
  integrations: [react()],
});