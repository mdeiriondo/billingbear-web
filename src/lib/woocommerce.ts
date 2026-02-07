/**
 * Cliente para comunicarse con la REST API de WooCommerce
 * Maneja la creación de órdenes y obtención de links de checkout
 */

export interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

interface CreateOrderParams {
  productId: number;
  recipientName: string;
  recipientEmail: string;
  message?: string;
}

interface WooCommerceOrder {
  id: number;
  status: string;
  checkout_payment_url?: string;
  payment_url?: string;
  meta_data?: Array<{ key: string; value: string }>;
}

/**
 * Obtiene la configuración de WooCommerce desde variables de entorno
 */
function getWooCommerceConfig(): WooCommerceConfig {
  let url = (import.meta.env.WOOCOMMERCE_URL || 'https://billingbearpark.com').trim();
  // Asegurar que la URL de producción use HTTPS (evita 401/500 por redirección)
  if (url.startsWith('http://') && url.includes('billingbearpark.com')) {
    url = url.replace('http://', 'https://');
  }
  const consumerKey = (import.meta.env.WOOCOMMERCE_CONSUMER_KEY || '').trim();
  const consumerSecret = (import.meta.env.WOOCOMMERCE_CONSUMER_SECRET || '').trim();

  if (!consumerKey || !consumerSecret) {
    throw new Error('WooCommerce credentials not configured. Please set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET environment variables.');
  }

  return { url, consumerKey, consumerSecret };
}

/**
 * Crea la autenticación básica para WooCommerce API
 */
function createAuthHeader(consumerKey: string, consumerSecret: string): string {
  const credentials = `${consumerKey}:${consumerSecret}`;
  // Usar btoa para base64 encoding (compatible con Node.js y browser)
  if (typeof Buffer !== 'undefined') {
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }
  // Fallback para entornos sin Buffer (aunque esto no debería pasar en el servidor)
  return `Basic ${btoa(credentials)}`;
}

/**
 * Crea una orden en WooCommerce con los datos del destinatario del voucher.
 * En Cloudflare Pages las credenciales suelen estar solo en runtime (no en build);
 * pasa runtimeConfig desde la ruta API (locals.runtime.env) para usarlas.
 */
export async function createVoucherOrder(
  params: CreateOrderParams,
  runtimeConfig?: WooCommerceConfig
): Promise<{ orderId: number; orderKey: string | null }> {
  const config = runtimeConfig ?? getWooCommerceConfig();
  const apiUrl = `${config.url}/wp-json/wc/v3/orders`;
  
  const orderData = {
    // No especificar payment_method para que WooCommerce use el método por defecto (Paymentsense)
    // payment_method se seleccionará en el checkout
    set_paid: false,
    line_items: [
      {
        product_id: params.productId,
        quantity: 1
      }
    ],
    meta_data: [
      {
        key: 'recipient_name',
        value: params.recipientName
      },
      {
        key: 'recipient_email',
        value: params.recipientEmail
      },
      ...(params.message ? [{
        key: 'recipient_message',
        value: params.message
      }] : [])
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': createAuthHeader(config.consumerKey, config.consumerSecret)
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.message || errorData.message_detail || response.statusText;
      // Log en servidor para depurar (sin credenciales)
      console.error('[WooCommerce] create order failed:', response.status, config.url, msg);
      throw new Error(`WooCommerce API error: ${msg} (${response.status})`);
    }

    const order: WooCommerceOrder = await response.json();

    // Retornar orderId y orderKey para usar en nuestra página de checkout personalizada
    return {
      orderId: order.id,
      orderKey: order.order_key || null
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create order in WooCommerce');
  }
}

/**
 * Construye WooCommerceConfig desde un objeto env (p. ej. locals.runtime.env en Cloudflare).
 * Útil para páginas SSR y API routes que reciben runtime env.
 */
export function getWooConfigFromEnv(env: Record<string, unknown> | undefined): WooCommerceConfig | undefined {
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

/**
 * Obtiene información de un producto de WooCommerce
 */
export async function getProduct(productId: number, runtimeConfig?: WooCommerceConfig): Promise<any> {
  const config = runtimeConfig ?? getWooCommerceConfig();
  const apiUrl = `${config.url}/wp-json/wc/v3/products/${productId}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(config.consumerKey, config.consumerSecret)
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`WooCommerce API error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch product from WooCommerce');
  }
}

/**
 * Obtiene los detalles de una orden de WooCommerce.
 * En Cloudflare Pages pasa runtimeConfig desde Astro.locals.runtime.env.
 */
export async function getOrder(orderId: number, runtimeConfig?: WooCommerceConfig): Promise<any> {
  const config = runtimeConfig ?? getWooCommerceConfig();
  const apiUrl = `${config.url}/wp-json/wc/v3/orders/${orderId}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(config.consumerKey, config.consumerSecret)
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`WooCommerce API error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch order from WooCommerce');
  }
}

/**
 * Obtiene el order key de una orden (necesario para validar el pago)
 */
export async function getOrderKey(orderId: number, runtimeConfig?: WooCommerceConfig): Promise<string | null> {
  try {
    const order = await getOrder(orderId, runtimeConfig);
    return order.order_key || null;
  } catch (error) {
    return null;
  }
}
