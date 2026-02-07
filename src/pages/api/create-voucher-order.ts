import type { APIRoute } from 'astro';
import { createVoucherOrder, type WooCommerceConfig } from '../../lib/woocommerce';

// Este endpoint debe ejecutarse en el servidor, no prerenderizarse
export const prerender = false;

type LocalsWithRuntime = { runtime?: { env?: Record<string, unknown> } };

/** Obtiene config de WooCommerce desde runtime env (Cloudflare) o import.meta.env (dev). */
function getWooConfigFromContext(locals: LocalsWithRuntime): WooCommerceConfig | undefined {
  const env = locals.runtime?.env;
  if (!env) return undefined;
  const url = typeof env.WOOCOMMERCE_URL === 'string' ? env.WOOCOMMERCE_URL.trim() : '';
  const consumerKey = typeof env.WOOCOMMERCE_CONSUMER_KEY === 'string' ? env.WOOCOMMERCE_CONSUMER_KEY.trim() : '';
  const consumerSecret = typeof env.WOOCOMMERCE_CONSUMER_SECRET === 'string' ? env.WOOCOMMERCE_CONSUMER_SECRET.trim() : '';
  if (!consumerKey || !consumerSecret) return undefined;
  let baseUrl = url || 'https://billingbearpark.com';
  if (baseUrl.startsWith('http://') && baseUrl.includes('billingbearpark.com')) {
    baseUrl = baseUrl.replace('http://', 'https://');
  }
  return { url: baseUrl, consumerKey, consumerSecret };
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Intentar parsear el body como JSON directamente
    // Astro maneja automáticamente el Content-Type
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      // Si falla el parseo, verificar el Content-Type
      const contentType = request.headers.get('content-type') || '';
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          message: 'Content-Type must be application/json',
          received: contentType || 'none'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { productId, recipientName, recipientEmail, message } = body;

    // Validar campos requeridos
    if (!productId || !recipientName || !recipientEmail) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: {
            productId: !productId ? 'Product ID is required' : undefined,
            recipientName: !recipientName ? 'Recipient name is required' : undefined,
            recipientEmail: !recipientEmail ? 'Recipient email is required' : undefined,
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar que productId sea un número
    const productIdNum = parseInt(productId, 10);
    if (isNaN(productIdNum) || productIdNum <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid product ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Credenciales en runtime (Cloudflare) o desde import.meta.env en dev
    const runtimeConfig = getWooConfigFromContext(locals);

    // Crear la orden en WooCommerce
    const result = await createVoucherOrder(
      {
        productId: productIdNum,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        message: message?.trim() || undefined
      },
      runtimeConfig ?? undefined
    );

    return new Response(
      JSON.stringify({
        success: true,
        orderId: result.orderId,
        orderKey: result.orderKey,
        checkoutUrl: `/checkout/${result.orderId}${result.orderKey ? `?key=${result.orderKey}` : ''}`
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error creating voucher order:', errMsg, error);
    
    // Manejar errores específicos
    if (error instanceof Error) {
      // Error de credenciales (401) o mensaje que lo indique
      if (errMsg.includes('credentials') || errMsg.includes('401') || errMsg.includes('Unauthorized')) {
        return new Response(
          JSON.stringify({ 
            error: 'WooCommerce authentication failed',
            message: 'Please check your API credentials'
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Error de producto no encontrado
      if (error.message.includes('not found') || error.message.includes('404')) {
        return new Response(
          JSON.stringify({ 
            error: 'Product not found',
            message: error.message
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'Failed to create order',
          message: error.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
