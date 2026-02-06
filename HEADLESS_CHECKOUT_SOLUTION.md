# Solución Headless Checkout Sin Afectar WordPress

## Resumen

Esta solución permite procesar pagos de WooCommerce sin mostrar WordPress al usuario, **sin modificar nada en el sitio WordPress existente**. Es completamente no invasiva.

## Cómo Funciona

### 1. Proxy Endpoint (`/api/checkout-proxy.ts`)

- **Función**: Obtiene el HTML del checkout de WooCommerce y lo modifica para ocultar header/footer
- **Ubicación**: Se ejecuta en tu servidor Astro
- **No afecta WordPress**: Solo lee el HTML, no modifica nada en WordPress

### 2. Página de Checkout Personalizada (`/checkout/[orderId]`)

- Muestra el resumen de la orden con diseño de tu sitio
- Carga el formulario de pago en un iframe que apunta al proxy
- El proxy sirve el HTML modificado que oculta WordPress

### 3. Flujo Completo

```
Usuario → Completa formulario voucher
       → Se crea orden en WooCommerce
       → Redirige a /checkout/[orderId] (tu página)
       → Iframe carga /api/checkout-proxy?orderId=X
       → Proxy obtiene HTML de WordPress
       → Proxy inyecta CSS/JS para ocultar header/footer
       → Usuario ve solo el formulario de pago
       → Usuario completa pago
       → WooCommerce procesa normalmente
       → Redirige a página de confirmación
```

## Ventajas

✅ **Cero impacto en WordPress**: No se modifica nada del sitio existente
✅ **No afecta usuarios actuales**: El sitio WordPress sigue funcionando igual
✅ **Mantiene seguridad**: Las cookies y sesiones se pasan correctamente
✅ **Fácil de mantener**: Si WordPress se actualiza, sigue funcionando
✅ **Reversible**: Puedes desactivar el proxy en cualquier momento

## Limitaciones

⚠️ **Cookies/Sesiones**: El proxy necesita pasar cookies correctamente. Si hay problemas de autenticación, puede requerir ajustes.

⚠️ **Contenido Dinámico**: Si WooCommerce carga contenido dinámicamente con JavaScript, puede requerir ajustes en el script de ocultación.

⚠️ **Performance**: El proxy agrega una capa adicional, pero el impacto es mínimo.

## Alternativa Más Simple (Si el Proxy Tiene Problemas)

Si el proxy tiene problemas con cookies o sesiones, puedes usar esta alternativa aún más simple:

### Opción B: Iframe Directo con CSS Injection

En lugar del proxy, puedes cargar el iframe directamente desde WordPress pero usar CSS para ocultar elementos:

```astro
<iframe 
  src={`https://billingbearpark.com/checkout/order-pay/${order.id}/?pay_for_order=true&key=${orderKey}`}
  class="w-full border-0"
  style="min-height: 600px;"
></iframe>

<style>
  /* Esto solo funciona si el iframe permite estilos desde el padre */
  /* WooCommerce puede tener restricciones de seguridad */
</style>
```

**Nota**: Esta opción puede no funcionar debido a políticas de seguridad del navegador (CORS, X-Frame-Options).

## Solución Recomendada: Proxy

El proxy es la mejor solución porque:
1. No depende de políticas de seguridad del navegador
2. Tiene control total sobre el HTML
3. Puede modificar cualquier elemento antes de servirlo
4. No requiere cambios en WordPress

## Troubleshooting

### Si el formulario no carga:
- Verifica que las cookies se estén pasando correctamente
- Revisa los logs del servidor para errores del proxy
- Asegúrate de que WooCommerce permite acceso desde tu dominio

### Si el pago no se procesa:
- Verifica que las cookies de sesión se mantengan
- Revisa que el iframe tenga los permisos correctos (`sandbox` attribute)
- Asegúrate de que Paymentsense funcione correctamente dentro del iframe

### Si WordPress se ve parcialmente:
- Ajusta los selectores CSS en `checkout-proxy.ts`
- Agrega más reglas CSS para ocultar elementos específicos de tu tema

## Próximos Pasos

1. **Probar el flujo completo**: Crear una orden de prueba y verificar que todo funcione
2. **Ajustar CSS**: Si ves elementos de WordPress, ajusta los selectores en el proxy
3. **Optimizar**: Una vez funcionando, puedes optimizar el código de ocultación
4. **Monitorear**: Revisar logs para asegurar que no hay errores

## Archivos Creados/Modificados

- ✅ `src/pages/api/checkout-proxy.ts` - Endpoint proxy (NUEVO)
- ✅ `src/pages/checkout/[orderId].astro` - Página de checkout (MODIFICADO)
- ✅ `src/lib/woocommerce.ts` - Funciones para obtener órdenes (MODIFICADO)
- ✅ `src/pages/api/create-voucher-order.ts` - Crea órdenes (MODIFICADO)

## Seguridad

- El proxy valida que solo se pueda acceder a órdenes válidas
- Las cookies se pasan de forma segura
- El iframe tiene restricciones de seguridad (`sandbox` attribute)
- No se almacenan datos sensibles en el proxy
