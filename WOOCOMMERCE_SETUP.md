# Configuración de WooCommerce Headless

Esta guía explica cómo configurar WooCommerce para funcionar como backend headless con el sitio Astro de Billingbear Park.

## Requisitos Previos

1. WordPress con WooCommerce instalado y configurado
2. Acceso de administrador a WordPress
3. Productos de WooCommerce creados para cada voucher

## Paso 1: Crear Credenciales de API REST

1. Inicia sesión en el panel de administración de WordPress
2. Navega a **WooCommerce > Settings > Advanced > REST API**
3. Haz clic en **"Add key"**
4. Completa el formulario:
   - **Description**: `Billingbear Web Headless` (o cualquier nombre descriptivo)
   - **User**: Selecciona una cuenta de administrador
   - **Permissions**: Selecciona **"Read/Write"**
5. Haz clic en **"Generate API key"**
6. **IMPORTANTE**: Copia inmediatamente el **Consumer Key** y **Consumer Secret** - no podrás ver el secret nuevamente

## Paso 2: Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env` en la raíz del proyecto:

   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y agrega tus credenciales:

   ```env
   WOOCOMMERCE_URL=https://billingbearpark.com
   WOOCOMMERCE_CONSUMER_KEY=ck_3b12ac063ac27b6dd1cea80b8c0dc6b5ebb2a1b8
   WOOCOMMERCE_CONSUMER_SECRET=cs_94d434cb263fd127a3146ae88c51fdd0728cf1cc
   ```

3. **NUNCA** subas el archivo `.env` al repositorio (ya está en `.gitignore`)

## Paso 3: Configurar Productos en WooCommerce

Para cada voucher que quieras vender:

1. Ve a **Products > Add New** en WordPress
2. Crea el producto con:
   - Nombre del voucher
   - Precio
   - Descripción (opcional)
   - Imagen (opcional)
3. **Guarda el Product ID** que aparece en la URL o en la lista de productos
4. En el Custom Post Type **Vouchers**, edita el voucher correspondiente
5. En el campo **"WooCommerce Product ID"**, ingresa el ID del producto que acabas de crear

## Paso 4: Configurar Método de Pago

El código por defecto usa `bacs` (Direct Bank Transfer). Si usas otro método de pago:

1. Edita `src/lib/woocommerce.ts`
2. Busca la función `createVoucherOrder`
3. Modifica los campos `payment_method` y `payment_method_title` según tu configuración:
   ```typescript
   payment_method: 'stripe', // o 'paypal', 'bacs', etc.
   payment_method_title: 'Credit Card', // o el nombre que prefieras
   ```

## Paso 5: Verificar que ACF Expone los Campos

Asegúrate de que el campo `woo_product_id` esté configurado en ACF:

1. Ve a **Custom Fields > Field Groups**
2. Busca el grupo **"Voucher Details"**
3. Verifica que exista el campo **"WooCommerce Product ID"**
4. Asegúrate de que tenga `show_in_rest: 1` activado

Si necesitas importar la configuración de ACF, usa los archivos `bbp.json` o `cpt.json` incluidos en el proyecto.

## Flujo de Compra

Una vez configurado, el flujo funciona así:

1. Usuario hace clic en **"Purchase Now"** en un voucher
2. Se abre un modal pidiendo:
   - Nombre del destinatario
   - Email del destinatario
   - Mensaje personalizado (opcional)
3. Al enviar, se crea una orden en WooCommerce con esos datos como metadata
4. El usuario es redirigido al checkout de WooCommerce para completar el pago
5. Los datos del destinatario están disponibles en la orden de WooCommerce para generar el voucher PDF posteriormente

## Troubleshooting

### Error: "WooCommerce credentials not configured"

- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de crear/editar `.env`

### Error: "WooCommerce authentication failed"

- Verifica que las credenciales sean correctas
- Asegúrate de que el usuario asociado a las credenciales tenga permisos de administrador
- Verifica que las credenciales tengan permisos "Read/Write"

### Error: "Product not found"

- Verifica que el `woo_product_id` en ACF corresponda a un producto real en WooCommerce
- Asegúrate de que el producto esté publicado y activo

### El modal no se abre

- Verifica que el componente tenga `client:load` en Astro
- Revisa la consola del navegador para errores de JavaScript

## Seguridad

- **NUNCA** expongas las credenciales de WooCommerce en el código cliente
- Las credenciales solo se usan en el servidor (endpoint API de Astro)
- Mantén el archivo `.env` fuera del control de versiones
- Considera rotar las credenciales periódicamente

## Próximos Pasos

Una vez que el checkout funcione, puedes:

1. Implementar generación automática de PDFs de vouchers usando los datos de `meta_data` en la orden
2. Enviar emails automáticos al destinatario cuando se complete el pago
3. Integrar con un sistema de gestión de vouchers para tracking y validación
