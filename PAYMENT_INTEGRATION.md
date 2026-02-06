# Integración de Pago Headless

Este documento explica las opciones para procesar pagos sin mostrar WordPress/WooCommerce al usuario.

## Estado Actual

Actualmente, cuando el usuario completa el formulario del voucher, se crea una orden en WooCommerce y se redirige a una página de checkout personalizada en Astro (`/checkout/[orderId]`). Sin embargo, esta página aún redirige al checkout de WordPress para procesar el pago.

## Opciones para Pago Completamente Headless

### Opción 1: Iframe del Formulario de Pago (Recomendada)

**Ventajas:**
- El usuario nunca ve WordPress
- Mantiene el diseño de tu sitio
- Fácil de implementar

**Implementación:**
1. Modificar `/checkout/[orderId].astro` para usar un iframe que cargue el formulario de pago de Paymentsense
2. El iframe puede cargar directamente desde Paymentsense o desde WooCommerce pero ocultando el header/footer

**Código ejemplo:**
```astro
<iframe 
  src={`https://billingbearpark.com/checkout/order-pay/${orderId}/?pay_for_order=true&key=${orderKey}&iframe=1`}
  class="w-full h-[600px] border-0"
  id="payment-iframe"
></iframe>
```

**Nota:** Necesitarías crear un endpoint en WordPress que retorne solo el formulario de pago sin header/footer, o usar CSS para ocultarlos.

### Opción 2: Integración Directa con Paymentsense

**Ventajas:**
- Control total sobre el formulario
- Mejor UX
- No depende de WordPress para el formulario

**Desventajas:**
- Requiere configuración adicional de Paymentsense
- Necesitas manejar la seguridad de tokens/credenciales

**Implementación:**
1. Obtener credenciales de Paymentsense API
2. Crear un componente React que use el SDK de Paymentsense
3. Procesar el pago y actualizar la orden en WooCommerce vía API

### Opción 3: Endpoint API Personalizado

**Ventajas:**
- Procesa el pago completamente en tu backend
- No muestra WordPress en ningún momento

**Implementación:**
1. Crear endpoint `/api/process-payment.ts` en Astro
2. Este endpoint se comunica con Paymentsense directamente
3. Una vez procesado, actualiza la orden en WooCommerce
4. Redirige a una página de confirmación

## Solución Temporal Actual

Por ahora, la página de checkout redirige al checkout de WooCommerce. Para mejorar esto sin mucho trabajo:

1. **Usar iframe con estilos ocultos:**
   - Crear un endpoint en WordPress que retorne solo el formulario
   - O usar CSS para ocultar header/footer del iframe

2. **Modal con iframe:**
   - Abrir el checkout en un modal con iframe
   - El usuario ve tu diseño alrededor del formulario

## Próximos Pasos Recomendados

1. **Corto plazo:** Implementar iframe con estilos para ocultar WordPress
2. **Mediano plazo:** Integrar Paymentsense directamente
3. **Largo plazo:** Migrar completamente a un sistema de pago independiente (Stripe, etc.)

## Archivos Modificados

- `src/pages/checkout/[orderId].astro` - Página de checkout personalizada
- `src/lib/woocommerce.ts` - Funciones para obtener órdenes
- `src/pages/api/create-voucher-order.ts` - Endpoint que crea órdenes y retorna URL de checkout personalizada

## Notas Importantes

- La orden se crea en WooCommerce con los datos del destinatario como metadata
- El `orderKey` se usa para validar que el usuario tiene permiso para pagar esa orden
- Una vez pagada, la orden puede usarse para generar el PDF del voucher automáticamente
