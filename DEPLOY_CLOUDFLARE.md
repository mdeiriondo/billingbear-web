# Deploy en Cloudflare Pages

Este proyecto está configurado para desplegarse en **Cloudflare Pages** con Astro SSR y el adaptador `@astrojs/cloudflare`.

## Configuración en Cloudflare Pages

### 1. Conectar el repositorio

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Conecta tu proveedor (GitHub, GitLab, etc.) y selecciona el repositorio.
3. Cloudflare detectará Astro; verifica o ajusta:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** (vacío o `/`)

### 2. Variables de entorno

En **Settings** → **Environment variables** (Build and deploy) añade:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `WOOCOMMERCE_URL` | URL base de la tienda WooCommerce | `https://billingbearpark.com` |
| `WOOCOMMERCE_CONSUMER_KEY` | Consumer Key de WooCommerce REST API | `ck_...` |
| `WOOCOMMERCE_CONSUMER_SECRET` | Consumer Secret de la misma API key | `cs_...` |
| `WORDPRESS_URL` | (Opcional) URL de WordPress. Si no se define, se usa `https://billingbearpark.com` | `https://billingbearpark.com` |

Sin estas variables, la creación de órdenes (vouchers) y el checkout fallarán.

### 3. Node version (build)

En la configuración del proyecto puedes fijar la versión de Node para el **build** (p. ej. 20) si hace falta. El runtime en producción es el de Cloudflare Workers, no Node.

### 4. Sesiones (KV) – opcional

Si usas sesiones de Astro en el futuro, el adaptador Cloudflare usa un binding KV llamado `SESSION`. En ese caso:

1. Crea un KV namespace en Cloudflare (Workers & Pages → KV → Create namespace).
2. Añade en `wrangler.jsonc` el binding, por ejemplo:
   ```json
   "kv_namespaces": [{ "binding": "SESSION", "id": "<TU_KV_NAMESPACE_ID>" }]
   ```

Si no usas sesiones, puedes ignorar este paso.

## Archivos de configuración

- **`wrangler.jsonc`**: nombre del proyecto y directorio de salida (`dist`) para Pages.
- **`astro.config.mjs`**: adaptador `@astrojs/cloudflare` en producción, `@astrojs/node` en dev.
- **`public/_headers`**: cabeceras de caché para assets estáticos (`/_astro/*`). El Cache-Control del HTML se aplica desde el middleware de Astro.

## Verificación post-deploy

1. El sitio carga correctamente.
2. Las páginas SSR y las rutas API (`/api/checkout-proxy`, `/api/create-voucher-order`) responden bien.
3. Flujo de compra/voucher y conexión con WooCommerce/WordPress funcionan.

## Recursos

- [Astro + Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare)
- [Cloudflare Pages – Framework Guides (Astro)](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Variables de entorno en Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)
