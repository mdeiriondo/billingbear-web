# Deploy en Netlify

## Configuración del sitio

- **Build command:** `npm run build` (ya en `netlify.toml`)
- **Publish directory:** `dist`
- **Node:** 20

## Variables de entorno en Netlify

En Netlify → Site → Site configuration → Environment variables, añade:

| Variable | Descripción | Ejemplo (producción) |
|----------|-------------|----------------------|
| `WOOCOMMERCE_URL` | URL base de la tienda WooCommerce | `https://billingbearpark.com` |
| `WOOCOMMERCE_CONSUMER_KEY` | Consumer Key de WooCommerce → Settings → Advanced → REST API | `ck_...` |
| `WOOCOMMERCE_CONSUMER_SECRET` | Consumer Secret de la misma API key | `cs_...` |
| `WORDPRESS_URL` | (Opcional) URL de WordPress para contenido. Si no se define, se usa `https://billingbearpark.com` | `https://billingbearpark.com` |

Sin estas variables, el sitio puede cargar pero la creación de órdenes (vouchers) y el checkout fallarán.

## Después del deploy

- La primera versión demo puede desplegarse con estos pasos.
- Para seguir trabajando en local: usa tu `.env` como hasta ahora (no se sube a git). Ver `LOCAL_DEV.md`.
