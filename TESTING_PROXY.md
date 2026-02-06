# Guía de Prueba del Proxy de Checkout

## Cómo Probar el Proxy

Tú necesitas probarlo porque el código se ejecuta en tu entorno. Aquí tienes una guía paso a paso:

### Paso 1: Verificar que el Servidor Esté Corriendo

```bash
npm run dev
```

Asegúrate de que el servidor esté corriendo en `http://localhost:4321` (o el puerto que uses).

### Paso 2: Crear una Orden de Prueba

1. Ve a tu sitio en `http://localhost:4321`
2. Haz clic en "Purchase Now" en cualquier voucher
3. Completa el formulario del destinatario
4. Esto debería crear una orden y redirigirte a `/checkout/[orderId]`

### Paso 3: Verificar que el Proxy Funcione

Una vez en la página de checkout (`/checkout/[orderId]`):

1. **Verifica que el iframe cargue:**
   - Deberías ver un iframe con el formulario de pago
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Network" o "Red"
   - Busca una solicitud a `/api/checkout-proxy?orderId=...`
   - Debería retornar status 200

2. **Verifica que WordPress esté oculto:**
   - Dentro del iframe, NO deberías ver:
     - Header de WordPress
     - Footer de WordPress
     - Navegación de WordPress
     - "Proudly powered by WordPress"
   - Solo deberías ver el formulario de pago

3. **Verifica la consola:**
   - Abre la consola del navegador (F12 → Console)
   - No debería haber errores relacionados con el proxy
   - Si hay errores, cópialos y compártelos

### Paso 4: Probar el Pago (Opcional)

Si quieres probar el flujo completo:

1. Completa el formulario de pago dentro del iframe
2. Procesa el pago (puedes usar datos de prueba de Paymentsense)
3. Verifica que después del pago se redirija correctamente

## Qué Buscar

### ✅ Señales de que Funciona Bien:

- El iframe carga sin errores
- No ves header/footer de WordPress dentro del iframe
- El formulario de pago es visible y funcional
- No hay errores en la consola del navegador
- La solicitud al proxy retorna 200 OK

### ⚠️ Problemas Comunes:

1. **El iframe no carga:**
   - Verifica que el endpoint `/api/checkout-proxy` exista
   - Revisa la consola para errores
   - Verifica que `orderId` y `key` se estén pasando correctamente

2. **Se ve WordPress dentro del iframe:**
   - Los selectores CSS pueden necesitar ajustes
   - Abre el iframe en una nueva pestaña para ver qué elementos hay
   - Comparte los nombres de clases/IDs que ves para ajustar el CSS

3. **Error 500 o 400:**
   - Revisa los logs del servidor de Astro
   - Verifica que la URL de WooCommerce sea correcta
   - Verifica que la orden exista en WooCommerce

4. **El formulario no funciona:**
   - Puede ser un problema de cookies/sesión
   - Verifica que el `sandbox` attribute del iframe permita formularios
   - Revisa la consola para errores de seguridad (CORS, etc.)

## Debugging

### Ver el HTML que Retorna el Proxy:

Puedes probar el proxy directamente en el navegador:

```
http://localhost:4321/api/checkout-proxy?orderId=4509&key=wc_order_X2j0pIzwy97yL
```

Esto debería mostrar el HTML del checkout con el CSS/JS inyectado.

### Ver Logs del Servidor:

En la terminal donde corre `npm run dev`, deberías ver:
- Requests al proxy
- Errores si los hay
- Información de depuración

### Inspeccionar el Iframe:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Elements" o "Elementos"
3. Busca el `<iframe id="payment-iframe">`
4. Haz clic derecho → "Inspect frame" o "Inspeccionar marco"
5. Esto te permite ver el contenido dentro del iframe

## Reportar Problemas

Si encuentras problemas, comparte:

1. **Screenshot** de cómo se ve el checkout
2. **Errores de consola** (si los hay)
3. **Logs del servidor** (si hay errores)
4. **URL completa** del checkout que estás probando
5. **Order ID** que estás usando

## Próximos Pasos Después de Probar

Una vez que pruebes:

1. **Si funciona bien:** ¡Perfecto! Puedes seguir usando esta solución
2. **Si hay problemas menores:** Comparte los detalles y los ajustamos
3. **Si no funciona:** Podemos cambiar a la solución del iframe directo (más simple pero menos elegante)

## Alternativa Rápida (Si el Proxy No Funciona)

Si el proxy tiene problemas, puedes cambiar temporalmente a iframe directo:

En `src/pages/checkout/[orderId].astro`, cambia:

```astro
src={`/api/checkout-proxy?orderId=${order.id}${orderKey ? `&key=${orderKey}` : ''}`}
```

Por:

```astro
src={`https://billingbearpark.com/checkout/order-pay/${order.id}/?pay_for_order=true${orderKey ? `&key=${orderKey}` : ''}`}
```

Esto cargará WordPress directamente en el iframe (se verá el header/footer pero funcionará).
