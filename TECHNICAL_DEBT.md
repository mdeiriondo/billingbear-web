# Technical Debt & Desarrollo Realizado

Resumen de funciones de bajo nivel, widgets y piezas específicas creadas para Billingbear Park (headless WordPress + WooCommerce en Astro).

---

## 1. Librerías / Funciones de bajo nivel

### `src/lib/wp.ts` — Cliente WordPress REST API

| Función | Descripción | Uso |
|--------|-------------|-----|
| `getCourses()` | Lista de cursos (`/wp-json/wp/v2/courses?_embed`) | Home, `getStaticPaths` de courses |
| `getCourseBySlug(slug)` | Un curso por slug | Página curso cuando no viene en props (dev) |
| `getHoles(courseId?)` | Lista de hoyos (`/wp-json/wp/v2/holes`) | Página de curso, scorecard |
| `getVouchers()` | Lista de vouchers (`/wp-json/wp/v2/vouchers?_embed`) | Home, /vouchers |
| `getCourseStatus()` | Estado del curso (Open/Restricted) desde ACF | Top bar (demo/estático por ahora) |

- **Config:** `WORDPRESS_URL` (env) o fallback `https://billingbearpark.com`.
- **Nota:** Custom post types `courses`, `holes`, `vouchers` deben existir en WordPress con REST habilitado.

### `src/lib/woocommerce.ts` — Cliente WooCommerce REST API (wc/v3)

| Función | Descripción | Uso |
|--------|-------------|-----|
| `getWooCommerceConfig()` | Lee `WOOCOMMERCE_URL`, Consumer Key/Secret de env | Interno |
| `createAuthHeader(ck, cs)` | Basic Auth en base64 para API | Todas las llamadas |
| `createVoucherOrder(params)` | POST orden con `recipient_name`, `recipient_email`, `recipient_message` en meta_data | `/api/create-voucher-order` |
| `getProduct(productId)` | GET producto por ID | Opcional / futuro |
| `getOrder(orderId)` | GET orden por ID | Checkout `[orderId].astro`, complete |
| `getOrderKey(orderId)` | Devuelve `order_key` de una orden | Checkout |

- **Config:** `WOOCOMMERCE_URL`, `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`. Si `WOOCOMMERCE_URL` es `http://billingbearpark.com` se fuerza a HTTPS en código.
- **Logging:** En fallo de `createVoucherOrder` se hace `console.error('[WooCommerce] create order failed:', status, url, msg)` en servidor.

---

## 2. Rutas API (servidor)

### `src/pages/api/create-voucher-order.ts`

- **Método:** POST.
- **Body:** `{ productId, recipientName, recipientEmail, message? }`.
- **Flujo:** Valida campos y email → `createVoucherOrder()` → responde `{ success, orderId, orderKey, checkoutUrl }` con `checkoutUrl` a `/checkout/{orderId}?key=...`.
- **Errores:** 400 (validación), 404 (producto no encontrado), 500 (credenciales / WooCommerce), con mensajes tipo "Please check your API credentials" para 401/credenciales.
- **Prerender:** `false`.

### `src/pages/api/checkout-proxy.ts`

- **Métodos:** GET y POST (misma lógica).
- **Query:** `orderId`, opcionalmente `key` (order key).
- **Función:** Proxy al checkout de WooCommerce (`.../checkout/order-pay/{orderId}/?pay_for_order=true&key=...`). Obtiene el HTML, inyecta CSS y JS para ocultar header/footer/newsletter de WordPress, reescribe `href`/`action` del checkout para que sigan pasando por este proxy.
- **Cookies:** Se reenvían al sitio WooCommerce para mantener sesión.
- **Deuda:** La URL base de WooCommerce está **hardcodeada** (`https://billingbearpark.com`). No usa `WOOCOMMERCE_URL`. Para multi-entorno habría que parametrizarla.

---

## 3. Widgets / Componentes React (client-side)

### `WeatherWidget` (`src/components/WeatherWidget.tsx`)

- **Uso:** Top bar (home y páginas con mismo layout).
- **Datos:** Open-Meteo API (`latitude=51.44, longitude=-0.82`), temperatura y `weather_code` (WMO).
- **UI:** Icono emoji + temperatura; mapeo WMO → emoji/label (clear, rain, snow, etc.).
- **Directiva:** `client:load`.

### `PurchaseButton` (`src/components/PurchaseButton.tsx`)

- **Props:** `productId`, `productName`, `price`, `className?`.
- **Comportamiento:** Al clic abre `VoucherFormModal`. En éxito recibe `checkoutUrl` y redirige con `window.location.href`.
- **Uso:** Tarjetas de vouchers en home y /vouchers.

### `VoucherFormModal` (`src/components/VoucherFormModal.tsx`)

- **Props:** `isOpen`, `onClose`, `productId`, `productName`, `price`, `onSuccess(checkoutUrl)`.
- **Contenido:** Formulario (nombre destinatario, email, mensaje opcional). Submit → POST a `/api/create-voucher-order` → en éxito llama `onSuccess(data.checkoutUrl)`.
- **Render:** `createPortal` a `document.body`, bloquea scroll cuando está abierto.
- **Uso:** Siempre detrás de `PurchaseButton`.

---

## 4. Páginas / Rutas relevantes

| Ruta | Descripción breve |
|------|--------------------|
| `/` | Home: vouchers (WordPress), cursos, hero, top bar con WeatherWidget, CTA a checkout. |
| `/vouchers` | Listado de vouchers (WP) + PurchaseButton por producto. |
| `/courses/[slug]` | Curso por slug; datos de WP (getCourses/getStaticPaths + getCourseBySlug en dev), hoyos, scorecard, BRS booking. Si no hay curso → redirect 404. |
| `/checkout/[orderId]` | Iframe con `src=/api/checkout-proxy?orderId=...&key=...`; redirección a `/checkout/complete?order=...` al finalizar pago. |
| `/checkout/complete` | Página de confirmación post-pago (query `order`). |
| `/history`, `/events`, `/contact` | Contenido estático + layout común. |

---

## 5. Configuración y entorno

- **Astro:** `output: "server"`. Adapter **Node** en dev, **Cloudflare Pages** en build (`NODE_ENV=production`). Ver `astro.config.mjs`.
- **Estilos:** Tailwind 4 (`@tailwindcss/vite`), `src/styles/global.css` importado en `Layout.astro`.
- **Env:** `.env` (no commiteado). Ejemplo en `.env.example`. Deploy: `DEPLOY_CLOUDFLARE.md`.
- **Local:** Node en dev evita problemas de __DEFINES__/MIME con el plugin de Cloudflare en dev. Ver `LOCAL_DEV.md`.

---

## 6. Deuda técnica y mejoras posibles

| Tema | Detalle |
|------|---------|
| **checkout-proxy URL** | Base WooCommerce fija a `https://billingbearpark.com`. Conviene usar `WOOCOMMERCE_URL` (env) para staging/otros entornos. |
| **Archivos duplicados** | Existen copias/alternativas no usadas en producción: `index copy.astro`, `[slug] copy.astro`, `[slug]a.astro`, `[slug]orig.astro`, `history copy.astro`, `vouchers-old.astro`. Limpiar cuando se confirme que no se necesitan. |
| **getHoles** | No garantiza siempre un array (si la API devuelve error como objeto). En `[slug].astro` se usa `Array.isArray(allHoles) ? allHoles : []` como defensa; en `wp.ts` se podría normalizar siempre a array. |
| **Tipado** | Uso de `any` en cursos/holes/vouchers en varios sitios. Definir interfaces (p. ej. `WPCourse`, `WPHole`, `WPVoucher`) y usarlas en lib y páginas. |
| **getCourseStatus** | Top bar usa datos de demo (statusData estático). Si en el futuro se quiere dato real, ya existe `getCourseStatus()` en `wp.ts`; falta enlazarlo a la UI. |
| **Manejo de errores API** | Mensajes de error de WooCommerce (message_detail, etc.) podrían exponerse de forma más uniforme en create-voucher-order y en el modal (sin revelar datos sensibles). |

---

## 7. Documentos relacionados

- `LOCAL_DEV.md` — Cómo correr en local (Node adapter, .env, caché).
- `DEPLOY_CLOUDFLARE.md` — Variables de entorno y pasos para deploy en Cloudflare Pages.
- `.env.example` — Variables esperadas (sin valores).
