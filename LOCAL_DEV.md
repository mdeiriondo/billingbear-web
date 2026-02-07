# Desarrollo local con WordPress local

## Errores de consola (__DEFINES__, MIME type text/css)

En local el proyecto usa el adapter **Node** en lugar de Cloudflare, así se evitan los errores del plugin de Cloudflare en dev (`__DEFINES__ is not defined`, scripts con MIME type incorrecto). El **build para Cloudflare Pages** usa el adapter Cloudflare (`npm run build` con `NODE_ENV=production`).

**Si sigues viendo errores, limpia caché y prueba en ventana de incógnito:**

1. Para el servidor (Ctrl+C).
2. Borra caché de Astro y Vite:
   ```bash
   rm -rf .astro node_modules/.vite
   ```
3. Arranca de nuevo: `npm run dev`
4. Abre `http://localhost:4321` en **ventana de incógnito** (o en DevTools → Application → Storage → Clear site data para localhost).
5. Si tienes algún service worker de localhost, desregístralo en DevTools → Application → Service Workers.

---

## WordPress local (billingbear-api.local)

El código ya usa variables de entorno (no hace falta tocar código).

**Para que la copia local use tu WordPress en `billingbear-api.local`**, en tu `.env` pon:

```
WORDPRESS_URL=http://billingbear-api.local
WOOCOMMERCE_URL=http://billingbear-api.local
```

(Si usas HTTPS en local, cambia a `https://billingbear-api.local`.)

Las credenciales WooCommerce (`WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`) tienen que ser las de esa instancia local si quieres probar checkout; si solo quieres ver contenido, con las dos URLs basta.

**Para desplegar:** no subas el `.env` (está en `.gitignore`). En Cloudflare Pages configura las mismas variables en el panel (Settings → Environment variables) con los valores de producción.
