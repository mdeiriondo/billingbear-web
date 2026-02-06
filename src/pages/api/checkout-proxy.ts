import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Proxy endpoint que obtiene el HTML del checkout de WooCommerce
 * y lo modifica para ocultar header/footer, sin afectar WordPress
 */
// Manejar tanto GET como POST para el proxy
export const GET: APIRoute = async ({ request, url }) => {
  return handleProxyRequest(request, url);
};

export const POST: APIRoute = async ({ request, url }) => {
  return handleProxyRequest(request, url);
};

async function handleProxyRequest(request: Request, url: URL) {
  try {
    const orderId = url.searchParams.get('orderId');
    const orderKey = url.searchParams.get('key');

    if (!orderId) {
      return new Response('Order ID is required', { status: 400 });
    }

    // Construir URL del checkout de WooCommerce
    let wooUrl = `https://billingbearpark.com/checkout/order-pay/${orderId}/?pay_for_order=true${orderKey ? `&key=${orderKey}` : ''}`;
    
    // Si hay otros parámetros en la URL, pasarlos también
    const otherParams = Array.from(url.searchParams.entries())
      .filter(([key]) => key !== 'orderId' && key !== 'key')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    if (otherParams) {
      wooUrl += `&${otherParams}`;
    }

    // Obtener el HTML del checkout
    // IMPORTANTE: Pasar cookies del request original para mantener la sesión
    const cookies = request.headers.get('cookie') || '';
    
    // Preparar headers para el fetch
    const fetchHeaders: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (compatible; BillingbearHeadless/1.0)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };
    
    if (cookies) {
      fetchHeaders['Cookie'] = cookies;
    }
    
    // Si es POST, pasar el body y Content-Type
    const method = request.method;
    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
      redirect: 'follow',
    };
    
    if (method === 'POST') {
      const contentType = request.headers.get('content-type');
      if (contentType) {
        fetchHeaders['Content-Type'] = contentType;
      }
      // Pasar el body del request original
      const body = await request.clone().text();
      if (body) {
        fetchOptions.body = body;
      }
    }
    
    const response = await fetch(wooUrl, fetchOptions);
    
    // Debug: Verificar respuesta
    console.log('Proxy fetch status:', response.status, response.statusText);
    console.log('Proxy fetch URL:', wooUrl);

    if (!response.ok) {
      // Si es una redirección, seguirla
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          // Si la redirección es a order-received, retornar HTML especial
          if (location.includes('order-received') || location.includes('thank-you')) {
            return new Response(
              `<html><body><script>window.parent.postMessage({type: 'payment-complete', orderId: '${orderId}'}, '*');</script><p>Payment completed. Redirecting...</p></body></html>`,
              {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
              }
            );
          }
          // Seguir la redirección
          const redirectUrl = location.startsWith('http') ? location : `https://billingbearpark.com${location}`;
          const redirectResponse = await fetch(redirectUrl, fetchOptions);
          if (!redirectResponse.ok) {
            return new Response(`Failed to fetch redirected checkout: ${redirectResponse.statusText}`, { 
              status: redirectResponse.status 
            });
          }
          const redirectHtml = await redirectResponse.text();
          const redirectCookies = redirectResponse.headers.get('set-cookie');
          return processHtml(redirectHtml, orderId, orderKey, redirectCookies);
        }
      }
      return new Response(`Failed to fetch checkout: ${response.statusText}`, { 
        status: response.status 
      });
    }

    let html = await response.text();
    
    // Debug: Verificar que el HTML tenga contenido
    if (!html || html.length < 500) {
      console.error('Warning: HTML from WooCommerce is very short:', html.substring(0, 500));
      return new Response(
        `Error: Received empty or invalid HTML from WooCommerce. Length: ${html?.length || 0}`,
        { status: 500 }
      );
    }
    
    const responseCookies = response.headers.get('set-cookie');
    return processHtml(html, orderId, orderKey, responseCookies);
  } catch (error) {
    console.error('Error proxying checkout:', error);
    return new Response(
      `Error loading checkout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

function processHtml(html: string, orderId: string | null, orderKey: string | null, responseCookies: string | null = null) {
    // Verificar que el HTML no esté vacío
    if (!html || html.length < 100) {
      console.error('Warning: HTML is very short, may be empty');
      return new Response('Error: Empty or invalid HTML received from WooCommerce', { status: 500 });
    }

    // Modificar el HTML para ocultar header, footer y navegación
    // Esto se hace mediante inyección de CSS y JavaScript sin modificar WordPress
    const cssToInject = `
      <style id="headless-checkout-styles">
        /* Ocultar header de WordPress */
        header, 
        .site-header,
        #masthead,
        nav.main-navigation,
        .main-navigation,
        .site-branding,
        .wp-block-site-title,
        .wp-block-site-logo,
        /* Ocultar footer */
        footer,
        .site-footer,
        #colophon,
        /* Ocultar breadcrumbs y navegación */
        .breadcrumbs,
        .woocommerce-breadcrumb,
        /* Ocultar sidebar si existe */
        aside,
        .sidebar,
        /* Ocultar "Proudly powered by WordPress" */
        .site-info,
        /* NOTA: La ocultación del newsletter se hace solo con JavaScript */
        /* para evitar ocultar accidentalmente el contenido del checkout */
        /* Asegurar que el contenido principal sea visible */
        .site-content,
        .content-area,
        .woocommerce {
          margin-top: 0 !important;
        }
        /* IMPORTANTE: NO ocultar el contenido del checkout */
        .woocommerce-checkout,
        .woocommerce form,
        .payment_method_paymentsense,
        .payment_box,
        form.checkout,
        #payment {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
        }
        /* Evitar scroll vertical innecesario */
        html, body {
          overflow-x: hidden !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        /* Asegurar que el contenido del checkout ocupe el ancho completo */
        .woocommerce-checkout,
        .entry-content,
        main {
          width: 100% !important;
          max-width: 100% !important;
          padding-left: 1rem !important;
          padding-right: 1rem !important;
          box-sizing: border-box !important;
        }
        /* Ocultar elementos específicos de WooCommerce checkout */
        .woocommerce-checkout-header,
        .woocommerce-checkout-footer {
          display: none !important;
        }
        /* Ajustar padding del contenido */
        .entry-content,
        .woocommerce-checkout {
          padding-top: 2rem !important;
          padding-bottom: 2rem !important;
        }
        /* Asegurar que el body no tenga scroll innecesario */
        body {
          overflow-x: hidden !important;
        }
        /* Ocultar elementos con el data-form específico del newsletter */
        /* Se manejará con JavaScript para mayor precisión */
        /* Ocultar mensajes de WordPress arriba */
        .wp-block-group__inner-container > p:first-child,
        .entry-header {
          display: none !important;
        }
      </style>
    `;

    const jsToInject = `
      <script>
        // Ejecutar después de que la página cargue para ocultar elementos dinámicos
        (function() {
          function hideWordPressElements() {
            // Ocultar header si existe
            const headers = document.querySelectorAll('header, .site-header, #masthead, nav.main-navigation');
            headers.forEach(el => el.style.display = 'none');
            
            // Ocultar footer si existe
            const footers = document.querySelectorAll('footer, .site-footer, #colophon');
            footers.forEach(el => el.style.display = 'none');
            
            // Ocultar navegación
            const navs = document.querySelectorAll('nav:not(.woocommerce-checkout)');
            navs.forEach(el => {
              if (!el.closest('.woocommerce-checkout')) {
                el.style.display = 'none';
              }
            });
            
            // Ocultar "Proudly powered by WordPress"
            const poweredBy = document.querySelectorAll('.site-info, [class*="powered-by"]');
            poweredBy.forEach(el => el.style.display = 'none');
            
            // Función para ocultar newsletter de forma segura
            function hideNewsletter() {
              // PRIMERO: Asegurar que TODO el contenido del checkout sea visible
              const checkoutSelectors = [
                '.woocommerce-checkout',
                '.payment_method_paymentsense',
                'form.checkout',
                '#payment',
                '.payment_box',
                '.woocommerce form',
                'form[action*="checkout"]',
                '.woocommerce',
                'table.woocommerce-checkout-review-order-table',
                '.woocommerce-checkout-payment'
              ];
              
              checkoutSelectors.forEach(selector => {
                try {
                  document.querySelectorAll(selector).forEach(el => {
                    el.style.display = '';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    el.style.height = 'auto';
                    el.style.overflow = 'visible';
                  });
                } catch (e) {}
              });
              
              // SEGUNDO: Ocultar newsletter específicamente por data-form
              const newsletterForm = document.querySelector('[data-form="80a711ac-cd44-11ed-a867-edfac20c5bc7"]');
              if (newsletterForm) {
                const isInPaymentForm = newsletterForm.closest('.woocommerce-checkout, .payment_method_paymentsense, form.checkout, #payment, .payment_box, .woocommerce');
                if (!isInPaymentForm) {
                  newsletterForm.style.display = 'none';
                  newsletterForm.style.height = '0';
                  newsletterForm.style.overflow = 'hidden';
                  
                  // Ocultar contenedor padre
                  let parent = newsletterForm.parentElement;
                  let levels = 0;
                  while (parent && parent !== document.body && levels < 3) {
                    const isInCheckout = parent.closest('.woocommerce-checkout, .payment_method_paymentsense, form.checkout, .woocommerce');
                    if (!isInCheckout) {
                      parent.style.display = 'none';
                      parent.style.height = '0';
                      break;
                    }
                    parent = parent.parentElement;
                    levels++;
                  }
                }
              }
              
              // TERCERO: Ocultar otros elementos de newsletter
              ['form[action*="emailoctopus"]', '[class*="emailoctopus"]', '[id*="emailoctopus"]'].forEach(selector => {
                try {
                  document.querySelectorAll(selector).forEach(el => {
                    if (!el.closest('.woocommerce-checkout, .payment_method_paymentsense, form.checkout, #payment, .woocommerce')) {
                      el.style.display = 'none';
                      el.style.height = '0';
                    }
                  });
                } catch (e) {}
              });
              
              // CUARTO: Ocultar por texto
              document.querySelectorAll('div, section').forEach(el => {
                if (el.closest('.woocommerce-checkout, .payment_method_paymentsense, form.checkout, .woocommerce')) return;
                const text = (el.textContent || '').toLowerCase();
                if ((text.includes('sign up to receive our newsletter') || text.includes('powered by emailoctopus')) &&
                    !el.querySelector('input[name*="card"], input[name*="cvv"], button[type="submit"]')) {
                  el.style.display = 'none';
                  el.style.height = '0';
                }
              });
            }
            
            // Ejecutar inmediatamente
            hideNewsletter();
            
            // Asegurar que el contenido del checkout sea visible
            const mainContent = document.querySelector('.woocommerce-checkout, .entry-content, main, .woocommerce');
            if (mainContent) {
              mainContent.style.display = 'block';
              mainContent.style.visibility = 'visible';
              mainContent.style.opacity = '1';
              mainContent.style.height = 'auto';
            }
          }
          
          // Ejecutar inmediatamente
          hideWordPressElements();
          
          // Ejecutar después de que el DOM esté listo
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', hideWordPressElements);
          }
          
          // Ejecutar después de que todo cargue (por si hay contenido dinámico)
          window.addEventListener('load', hideWordPressElements);
          
          // Observar cambios en el DOM (por si WooCommerce carga contenido dinámicamente)
          const observer = new MutationObserver(() => {
            hideWordPressElements();
            // Ocultar newsletter específicamente después de cambios
            setTimeout(() => {
              // Función inline para ocultar newsletter
              function hideNewsletter() {
                // Por selectores incluyendo el data-form específico
                document.querySelectorAll(
                  '[class*="emailoctopus"], ' +
                  '[id*="emailoctopus"], ' +
                  '[class*="EmailOctopus"], ' +
                  '[id*="EmailOctopus"], ' +
                  '[class*="newsletter"], ' +
                  '[data-form="80a711ac-cd44-11ed-a867-edfac20c5bc7"], ' +
                  '[data-form*="80a711ac"]'
                ).forEach(el => {
                  if (!el.closest('.woocommerce-checkout, .payment_method_paymentsense, form[action*="checkout"]')) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.height = '0';
                    el.style.overflow = 'hidden';
                    el.style.margin = '0';
                    el.style.padding = '0';
                  }
                });
                
                // Ocultar específicamente el formulario con data-form
                const newsletterForm = document.querySelector('[data-form="80a711ac-cd44-11ed-a867-edfac20c5bc7"]');
                if (newsletterForm) {
                  newsletterForm.style.display = 'none';
                  newsletterForm.style.visibility = 'hidden';
                  newsletterForm.style.height = '0';
                  const newsletterParent = newsletterForm.parentElement;
                  if (newsletterParent && !newsletterParent.closest('.woocommerce-checkout')) {
                    newsletterParent.style.display = 'none';
                    newsletterParent.style.height = '0';
                  }
                }
                // Por texto
                document.querySelectorAll('div, section, aside, .widget, .wp-block-group').forEach(el => {
                  if (el.closest('.woocommerce-checkout, .payment_method_paymentsense')) return;
                  const text = (el.textContent || '').toLowerCase();
                  if ((text.includes('sign up to receive our newsletter') || 
                       text.includes('powered by emailoctopus')) &&
                      !el.querySelector('input[name*="card"], input[name*="cvv"]')) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.height = '0';
                  }
                });
              }
              hideNewsletter();
            }, 100);
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          // Limpiar observer después de 30 segundos (más tiempo para contenido dinámico)
          setTimeout(() => observer.disconnect(), 30000);
        })();
        
        // Escuchar cuando el pago se complete y notificar al padre
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'payment-complete') {
            window.parent.postMessage({
              type: 'payment-complete',
              orderId: '${orderId}'
            }, '*');
          }
        });
        
        // Detectar redirección después del pago
        let lastUrl = location.href;
        setInterval(function() {
          if (location.href !== lastUrl) {
            lastUrl = location.href;
            // Si la URL cambia a una página de confirmación, notificar al padre
            if (location.href.includes('order-received') || location.href.includes('thank-you') || location.href.includes('order-complete')) {
              window.parent.postMessage({
                type: 'payment-complete',
                orderId: '${orderId}'
              }, '*');
            }
          }
        }, 500);
      </script>
    `;

    // Inyectar CSS antes del cierre de </head>
    if (html.includes('</head>')) {
      html = html.replace('</head>', cssToInject + '</head>');
    } else {
      // Si no hay </head>, inyectar al inicio del body
      html = html.replace('<body', cssToInject + '<body');
    }

    // Inyectar JavaScript antes del cierre de </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', jsToInject + '</body>');
    } else {
      // Si no hay </body>, agregar al final
      html = html + jsToInject;
    }
    
    // También modificar URLs relativas para que apunten al proxy
    // Esto evita el 404 cuando se hace clic en botones dentro del iframe
    html = html.replace(
      /href=["'](\/checkout\/order-pay\/[^"']+)["']/g,
      (match, path) => {
        const fullUrl = `https://billingbearpark.com${path}`;
        const proxyUrl = `/api/checkout-proxy?orderId=${orderId}${orderKey ? `&key=${orderKey}` : ''}`;
        // Extraer parámetros de la URL original y agregarlos al proxy
        try {
          const urlObj = new URL(fullUrl);
          const params = new URLSearchParams(urlObj.search);
          const proxyParams = new URLSearchParams();
          proxyParams.set('orderId', orderId);
          if (orderKey) proxyParams.set('key', orderKey);
          // Agregar otros parámetros
          params.forEach((value, key) => {
            if (key !== 'orderId' && key !== 'key') {
              proxyParams.set(key, value);
            }
          });
          return `href="/api/checkout-proxy?${proxyParams.toString()}"`;
        } catch {
          return match;
        }
      }
    );
    
    // También modificar action de formularios
    html = html.replace(
      /action=["'](\/checkout\/order-pay\/[^"']+)["']/g,
      (match, path) => {
        const fullUrl = `https://billingbearpark.com${path}`;
        try {
          const urlObj = new URL(fullUrl);
          const params = new URLSearchParams(urlObj.search);
          const proxyParams = new URLSearchParams();
          proxyParams.set('orderId', orderId);
          if (orderKey) proxyParams.set('key', orderKey);
          params.forEach((value, key) => {
            if (key !== 'orderId' && key !== 'key') {
              proxyParams.set(key, value);
            }
          });
          return `action="/api/checkout-proxy?${proxyParams.toString()}"`;
        } catch {
          return match;
        }
      }
    );

    // Retornar el HTML modificado
    // Pasar cookies de la respuesta de WooCommerce si existen
    const headers: HeadersInit = {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };
    
    if (responseCookies) {
      headers['Set-Cookie'] = responseCookies;
    }
    
    // Debug: Verificar que el HTML no esté vacío
    if (!html || html.length < 100) {
      console.error('Warning: HTML from proxy is very short:', html.substring(0, 200));
    }
    
    return new Response(html, {
      status: 200,
      headers,
    });
}
