# Guía de Prueba de Pagos con Paymentsense

## Tarjetas de Prueba

⚠️ **IMPORTANTE**: Paymentsense **NO proporciona tarjetas de prueba estándar públicas**. Necesitas contactarlos directamente para obtener las tarjetas de prueba específicas de tu cuenta.

### Cómo Obtener Tarjetas de Prueba de Paymentsense

1. **Contacta con el Soporte de Paymentsense:**
   - **Email:** support@paymentsense.com
   - **Teléfono:** Revisa tu portal de administración de Paymentsense
   - **Portal:** Accede a developers.paymentsense.com (requiere autenticación)

2. **Pregunta específicamente por:**
   - "Test card numbers for sandbox/testing environment"
   - "How to enable test mode in my account"
   - "Test card numbers for my merchant account [tu número de cuenta]"

3. **Información que necesitarás proporcionar:**
   - Tu número de cuenta de comerciante (merchant account number)
   - Tu ID de terminal (si aplica)
   - Confirmación de que quieres probar en modo sandbox/test

### Tarjetas de Prueba Genéricas (Pueden No Funcionar)

Si Paymentsense usa un sistema estándar, estas podrían funcionar (pero **no está garantizado**):

**Visa (Aprobada):**
- Número: `4242 4242 4242 4242`
- Fecha de expiración: Cualquier fecha futura (ej: `12/25`)
- CVV: Cualquier 3 dígitos (ej: `123`)
- Código postal: Cualquier código postal válido (ej: `SW1A 1AA`)

**Mastercard (Aprobada):**
- Número: `5555 5555 5555 4444`
- Fecha de expiración: Cualquier fecha futura (ej: `12/25`)
- CVV: Cualquier 3 dígitos (ej: `123`)

⚠️ **Estas tarjetas probablemente NO funcionarán** con Paymentsense sin configuración específica de tu cuenta.

## Cómo Probar Sin Riesgo

### Opción 1: Modo Sandbox/Test de Paymentsense

1. Verifica si Paymentsense tiene un modo sandbox en tu configuración de WooCommerce
2. Activa el modo de prueba si está disponible
3. Usa las tarjetas de prueba proporcionadas por Paymentsense

### Opción 2: Crear una Orden de Prueba con Monto Mínimo

1. Crea un voucher con el precio más bajo posible (ej: £1.00)
2. Usa una tarjeta de prueba
3. Si funciona, cancela la orden manualmente en WooCommerce después

### Opción 3: Usar un Entorno de Desarrollo

Si tienes acceso a un entorno de desarrollo/staging:
1. Configura Paymentsense en modo sandbox allí
2. Prueba todo el flujo sin riesgo
3. Una vez verificado, despliega a producción

## Verificar que el Pago Funciona

Después de usar una tarjeta de prueba:

1. **En WooCommerce Admin:**
   - Ve a WooCommerce > Orders
   - Busca la orden que acabas de crear
   - Verifica que el estado cambió a "Processing" o "Completed"
   - Revisa que los datos del destinatario están en "Order Meta"

2. **En tu sitio Astro:**
   - Después del pago, deberías ser redirigido a una página de confirmación
   - Verifica que la URL cambia correctamente

3. **En el iframe:**
   - El iframe debería mostrar una página de confirmación
   - O debería cerrarse y redirigir a tu página de confirmación

## Troubleshooting

### Si las tarjetas de prueba no funcionan:

1. **Verifica la configuración de Paymentsense:**
   - ¿Está en modo producción o sandbox?
   - ¿Hay restricciones de IP o dominio?

2. **Revisa los logs:**
   - WooCommerce > Status > Logs
   - Busca errores relacionados con Paymentsense

3. **Contacta con Paymentsense:**
   - Pregunta por las tarjetas de prueba específicas de tu cuenta
   - Verifica que tu cuenta tenga acceso a modo sandbox

### Si el pago se procesa pero no se actualiza la orden:

1. Verifica los webhooks de Paymentsense en WooCommerce
2. Revisa que las notificaciones de pago estén configuradas
3. Verifica los logs de WooCommerce para errores

## Plan de Acción Recomendado para Probar el Flujo Completo

### Paso 1: Verificar el Flujo Hasta el Formulario de Pago ✅

**Ya puedes hacer esto ahora:**

1. **Probar la creación de orden:**
   - Ve a `/vouchers` o la página principal
   - Haz clic en "Purchase Now" en cualquier voucher
   - Completa el formulario modal (nombre, email, mensaje)
   - Verifica que te redirige a `/checkout/[orderId]`

2. **Verificar que el iframe carga:**
   - En la página de checkout, verifica que el iframe se carga
   - Abre la consola del navegador (F12) y verifica que no hay errores
   - Verifica que el formulario de pago de Paymentsense aparece dentro del iframe

3. **Verificar que el newsletter está oculto:**
   - Revisa que no aparece el formulario de newsletter dentro del iframe
   - Verifica que solo se ve el formulario de pago

### Paso 2: Obtener Credenciales de Prueba de Paymentsense 📧

**Acción inmediata:**

1. **Contacta a Paymentsense:**
   - Email: support@paymentsense.com
   - Pregunta específicamente: "Necesito tarjetas de prueba para mi cuenta de comerciante [tu número]"
   - Menciona que necesitas probar en modo sandbox/test

2. **Información que necesitarás:**
   - Tu número de cuenta de comerciante (merchant account number)
   - Tu ID de terminal
   - Confirmación de que quieres activar modo test/sandbox

3. **Mientras tanto:**
   - Verifica en WooCommerce > Settings > Payments > Paymentsense si hay una opción de "Test Mode"
   - Si existe, actívala temporalmente

### Paso 3: Probar el Pago Completo 💳

**Una vez que tengas las credenciales:**

1. **Usa las tarjetas de prueba proporcionadas por Paymentsense**
2. **Completa el formulario de pago** dentro del iframe
3. **Verifica que:**
   - El pago se procesa correctamente
   - Te redirige a `/checkout/complete?order=[orderId]`
   - La página de confirmación muestra los detalles correctos
   - La orden en WooCommerce cambia a "Processing" o "Completed"
   - Los datos del destinatario están guardados en los meta datos de la orden

### Paso 4: Verificar en WooCommerce Admin 🔍

**Después de cada prueba:**

1. Ve a WooCommerce > Orders en WordPress
2. Busca la orden que acabas de crear
3. Verifica:
   - Estado de la orden (debe ser "Processing" o "Completed")
   - Datos del destinatario en "Order Meta":
     - `recipient_name`
     - `recipient_email`
     - `recipient_message` (si se proporcionó)
   - Método de pago (debe ser "Paymentsense")
   - Monto total correcto

### Alternativa: Probar Solo el Flujo (Sin Procesar Pago Real)

Si no puedes obtener tarjetas de prueba inmediatamente:

1. **Prueba hasta el formulario de pago:**
   - Verifica que el formulario carga correctamente
   - Verifica que los campos son interactivos
   - Verifica que no hay errores en la consola
   - Verifica que puedes escribir en los campos (aunque no proceses el pago)

2. **Simula el éxito del pago (solo para desarrollo):**
   - Puedes modificar temporalmente el código del proxy para simular un pago exitoso
   - Esto te permite probar el flujo completo sin procesar un pago real
   - **IMPORTANTE:** Recuerda revertir estos cambios antes de producción

3. **Usa un servicio de prueba:**
   - Algunos servicios como Stripe tienen mejores herramientas de prueba
   - Considera migrar a Stripe si Paymentsense no ofrece buen soporte de pruebas

## Contacto con Paymentsense

Para obtener las tarjetas de prueba específicas de tu cuenta:

- **Email:** support@paymentsense.com
- **Teléfono:** Revisa tu cuenta de Paymentsense para el número de soporte
- **Portal:** Accede a tu portal de administración de Paymentsense

Pregunta específicamente por:
- "Test card numbers for sandbox/testing"
- "How to enable test mode"
- "Test card numbers for my merchant account"
