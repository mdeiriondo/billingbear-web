# Checklist de Pruebas - Sistema de Vouchers Headless

## ✅ Pruebas que Ya Puedes Hacer (Sin Tarjetas de Prueba)

### 1. Flujo de Creación de Orden
- [ ] Navegar a `/vouchers` o página principal
- [ ] Hacer clic en "Purchase Now" en un voucher
- [ ] Verificar que se abre el modal de formulario
- [ ] Completar el formulario:
  - [ ] Nombre del destinatario
  - [ ] Email del destinatario
  - [ ] Mensaje personalizado (opcional)
- [ ] Hacer clic en "Create Order"
- [ ] Verificar que se muestra el spinner de carga
- [ ] Verificar que se redirige a `/checkout/[orderId]`

### 2. Página de Checkout
- [ ] Verificar que la página carga correctamente
- [ ] Verificar que muestra:
  - [ ] Número de orden
  - [ ] Resumen de productos
  - [ ] Nombre del destinatario
  - [ ] Monto total
- [ ] Verificar que el iframe se carga
- [ ] Verificar que el iframe tiene el tamaño correcto (ocupa el ancho completo)
- [ ] Abrir la consola del navegador (F12) y verificar:
  - [ ] No hay errores de JavaScript
  - [ ] No hay errores de CORS
  - [ ] El proxy se carga correctamente

### 3. Formulario de Pago en el Iframe
- [ ] Verificar que el formulario de Paymentsense aparece dentro del iframe
- [ ] Verificar que los campos son interactivos:
  - [ ] Campo de número de tarjeta
  - [ ] Campo de fecha de expiración
  - [ ] Campo de CVV
  - [ ] Campo de código postal
- [ ] Verificar que NO aparece:
  - [ ] Header de WordPress
  - [ ] Footer de WordPress
  - [ ] Navegación de WordPress
  - [ ] Formulario de newsletter
  - [ ] "Powered by WordPress"
- [ ] Verificar que el botón "Pay Order" es visible y clickeable

### 4. Verificación en WooCommerce Admin
- [ ] Ir a WordPress Admin > WooCommerce > Orders
- [ ] Buscar la orden recién creada (debe estar en estado "Pending")
- [ ] Abrir la orden y verificar:
  - [ ] Los meta datos contienen:
    - [ ] `recipient_name`
    - [ ] `recipient_email`
    - [ ] `recipient_message` (si se proporcionó)
  - [ ] El producto correcto está en la orden
  - [ ] El monto total es correcto
  - [ ] El método de pago es "Paymentsense" (o el que corresponda)

## 🔄 Pruebas que Requieren Tarjetas de Prueba

### 5. Proceso de Pago Completo
- [ ] Obtener tarjetas de prueba de Paymentsense (contactar support@paymentsense.com)
- [ ] En el formulario de pago dentro del iframe:
  - [ ] Ingresar número de tarjeta de prueba
  - [ ] Ingresar fecha de expiración válida
  - [ ] Ingresar CVV
  - [ ] Ingresar código postal
- [ ] Hacer clic en "Pay Order"
- [ ] Verificar que el pago se procesa
- [ ] Verificar que se redirige a `/checkout/complete?order=[orderId]`

### 6. Página de Confirmación
- [ ] Verificar que la página de confirmación carga correctamente
- [ ] Verificar que muestra:
  - [ ] Mensaje de éxito ("Thank You!")
  - [ ] Número de orden
  - [ ] Estado de la orden
  - [ ] Fecha de la orden
  - [ ] Email de confirmación
  - [ ] Detalles del producto
  - [ ] Nombre del destinatario
  - [ ] Mensaje personalizado (si se proporcionó)
  - [ ] Monto total pagado
- [ ] Verificar que los botones funcionan:
  - [ ] "Browse More Vouchers"
  - [ ] "Return Home"

### 7. Verificación Post-Pago en WooCommerce
- [ ] Ir a WooCommerce > Orders
- [ ] Buscar la orden pagada
- [ ] Verificar que el estado cambió a "Processing" o "Completed"
- [ ] Verificar que el método de pago es correcto
- [ ] Verificar que los datos del destinatario están guardados
- [ ] Verificar que el monto total es correcto

## 🐛 Troubleshooting

### Si el iframe está vacío:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Busca la solicitud a `/api/checkout-proxy`
4. Verifica el estado de la respuesta:
   - Si es 200: El HTML debería estar ahí, revisa los logs del servidor
   - Si es 404: Verifica que el endpoint existe
   - Si es 500: Revisa los logs del servidor de Astro
5. Revisa los logs del servidor de Astro para errores

### Si el newsletter sigue apareciendo:
1. Abre las herramientas de desarrollador (F12)
2. Inspecciona el elemento del newsletter dentro del iframe
3. Verifica que tiene el atributo `data-form="80a711ac-cd44-11ed-a867-edfac20c5bc7"`
4. Verifica que el JavaScript del proxy está ejecutándose
5. Revisa la consola del iframe (no la del padre) para errores

### Si el pago no redirige a la página de confirmación:
1. Verifica que la página `/checkout/complete.astro` existe
2. Abre la consola del navegador y busca mensajes de `postMessage`
3. Verifica que el proxy está enviando el mensaje `payment-complete`
4. Verifica que el script en `[orderId].astro` está escuchando los mensajes

## 📝 Notas Importantes

- **No proceses pagos reales durante las pruebas** a menos que sea absolutamente necesario
- **Cancela las órdenes de prueba** en WooCommerce después de probar
- **Contacta a Paymentsense** lo antes posible para obtener credenciales de prueba
- **Documenta cualquier problema** que encuentres para facilitar el debugging

## 🎯 Próximos Pasos

1. ✅ Completar todas las pruebas que no requieren tarjetas de prueba
2. 📧 Contactar a Paymentsense para obtener credenciales de prueba
3. 💳 Probar el flujo completo con tarjetas de prueba
4. 🚀 Una vez verificado, preparar para producción
