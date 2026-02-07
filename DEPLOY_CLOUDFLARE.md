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

### 2. Variables de entorno (obligatorio para comprar vouchers)

En **Settings** → **Environment variables** del proyecto en Cloudflare Pages añade:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `WOOCOMMERCE_URL` | URL base de la tienda WooCommerce | `https://billingbearpark.com` |
| `WOOCOMMERCE_CONSUMER_KEY` | Consumer Key de WooCommerce REST API | `ck_...` |
| `WOOCOMMERCE_CONSUMER_SECRET` | Consumer Secret de la misma API key | `cs_...` |
| `WORDPRESS_URL` | (Opcional) URL de WordPress. Si no se define, se usa `https://billingbearpark.com` | `https://billingbearpark.com` |

- **Alcance:** asígnalas al entorno **Production** (y a **Preview** si pruebas en ramas).
- **Cuándo se usan:** Astro/Vite reemplaza `import.meta.env` en **tiempo de build**, así que estas variables deben existir cuando Cloudflare ejecuta `npm run build`. Si las añades o cambias después del deploy, hay que **volver a desplegar** (nuevo build) para que se apliquen.
- Sin `WOOCOMMERCE_CONSUMER_KEY` y `WOOCOMMERCE_CONSUMER_SECRET`, al comprar un voucher verás **"Please check your API credentials"** y un 500 en `/api/create-voucher-order`.

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

## Troubleshooting

### "Please check your API credentials" al comprar un voucher

- **Causa:** La API de WooCommerce no tiene credenciales válidas en el entorno donde se ejecuta el build (Cloudflare Pages).
- **Qué hacer:**
  1. En Cloudflare Dashboard → **Workers & Pages** → tu proyecto → **Settings** → **Environment variables**, comprueba que existan `WOOCOMMERCE_CONSUMER_KEY` y `WOOCOMMERCE_CONSUMER_SECRET` para **Production** (y Preview si aplica).
  2. Los valores deben ser los de una **Application password** o **REST API key** de WooCommerce (WooCommerce → Ajustes → Avanzado → REST API). Sin espacios ni comillas.
  3. Después de añadir o cambiar variables, lanza un **nuevo deploy** (Deployments → "Retry deployment" o push a la rama) para que el build use las nuevas variables.

### Error 500 en la consola al llamar a `/api/create-voucher-order`

- Si el cuerpo de la respuesta dice "Please check your API credentials", sigue los pasos de arriba.
- Si WooCommerce devuelve 401, las mismas claves deben tener permisos **Read/Write** en la REST API de WooCommerce.

### "Access to storage is not allowed from this context"

- Suele aparecer en la consola del navegador al usar el checkout (iframe de WooCommerce/pasarela). No viene del código de este proyecto.
- Puede deberse a la política de cookies del navegador, al iframe del pago o a extensiones. No suele impedir que el pago se complete; si el pago falla, revisa antes las credenciales y el 500.

## Recursos

- [Astro + Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare)
- [Cloudflare Pages – Framework Guides (Astro)](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Variables de entorno en Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)
