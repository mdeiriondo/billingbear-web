/**
 * Script temporal para obtener los IDs correctos de WooCommerce para cada voucher
 * Ejecutar con: npx tsx scripts/get-voucher-woo-ids.ts
 */

// Importar funciones necesarias
// Nota: Este script necesita acceso a las funciones, así que las replicamos aquí

interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

function getWooCommerceConfig(): WooCommerceConfig {
  const url = process.env.WOOCOMMERCE_URL || 'https://billingbearpark.com';
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

  if (!consumerKey || !consumerSecret) {
    throw new Error('WooCommerce credentials not configured. Please set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET environment variables.');
  }

  return { url, consumerKey, consumerSecret };
}

function createAuthHeader(consumerKey: string, consumerSecret: string): string {
  const credentials = `${consumerKey}:${consumerSecret}`;
  if (typeof Buffer !== 'undefined') {
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

async function getVouchers() {
  // Intentar primero con la URL de producción, luego con local
  const WP_URL = process.env.WP_URL || "https://billingbearpark.com/wp-json/wp/v2";
  try {
    const res = await fetch(`${WP_URL}/vouchers?_embed&per_page=100`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    // Fallback a local si la producción falla
    const localUrl = "http://billingbear-api.local/wp-json/wp/v2";
    console.log(`⚠️  Intentando con URL local: ${localUrl}`);
    const res = await fetch(`${localUrl}/vouchers?_embed&per_page=100`);
    return await res.json();
  }
}

// Función para obtener productos de WooCommerce
async function getWooCommerceProducts() {
  const config = getWooCommerceConfig();
  const apiUrl = `${config.url}/wp-json/wc/v3/products?per_page=100`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(config.consumerKey, config.consumerSecret)
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching WooCommerce products:', error);
    throw error;
  }
}

// Función para normalizar nombres (eliminar caracteres especiales, convertir a minúsculas, etc.)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Función para hacer match entre voucher y producto
function findMatchingProduct(voucherTitle: string, products: any[]): any | null {
  const normalizedVoucher = normalizeName(voucherTitle);
  
  // Intentar match exacto primero
  for (const product of products) {
    const normalizedProduct = normalizeName(product.name);
    if (normalizedVoucher === normalizedProduct) {
      return product;
    }
  }
  
  // Intentar match parcial (si el nombre del voucher está contenido en el producto o viceversa)
  for (const product of products) {
    const normalizedProduct = normalizeName(product.name);
    if (normalizedVoucher.includes(normalizedProduct) || normalizedProduct.includes(normalizedVoucher)) {
      return product;
    }
  }
  
  // Intentar match por palabras clave comunes
  const voucherWords = normalizedVoucher.split(' ');
  for (const product of products) {
    const normalizedProduct = normalizeName(product.name);
    const productWords = normalizedProduct.split(' ');
    const commonWords = voucherWords.filter(word => word.length > 3 && productWords.includes(word));
    if (commonWords.length >= 2) {
      return product;
    }
  }
  
  return null;
}

async function main() {
  console.log('🔍 Obteniendo vouchers desde WordPress...\n');
  
  try {
    // Obtener vouchers
    const vouchers = await getVouchers();
    console.log(`✅ Encontrados ${vouchers.length} vouchers\n`);
    
    // Obtener productos de WooCommerce
    console.log('🔍 Obteniendo productos de WooCommerce...\n');
    const products = await getWooCommerceProducts();
    console.log(`✅ Encontrados ${products.length} productos de WooCommerce\n`);
    
    console.log('📋 LISTADO DE VOUCHERS Y SUS IDs DE WOOCOMMERCE:\n');
    console.log('='.repeat(80));
    console.log('| Voucher Name'.padEnd(50) + '| WooCommerce Product ID | Match Status |');
    console.log('='.repeat(80));
    
    const results: Array<{voucher: any, product: any | null}> = [];
    
    for (const voucher of vouchers) {
      const voucherTitle = voucher.title?.rendered || voucher.title || 'Sin título';
      const currentWooId = voucher.acf?.woo_product_id || 'No configurado';
      const matchingProduct = findMatchingProduct(voucherTitle, products);
      
      results.push({ voucher, product: matchingProduct });
      
      const status = matchingProduct 
        ? (matchingProduct.id.toString() === currentWooId?.toString() ? '✅ Correcto' : '⚠️  Diferente')
        : '❌ No encontrado';
      
      const productId = matchingProduct ? matchingProduct.id : 'N/A';
      const productName = matchingProduct ? matchingProduct.name.substring(0, 30) : 'N/A';
      
      console.log(`| ${voucherTitle.substring(0, 48).padEnd(48)} | ${productId.toString().padEnd(21)} | ${status.padEnd(12)} |`);
      if (matchingProduct && matchingProduct.name !== voucherTitle) {
        console.log(`|   └─ Producto WC: "${productName}"`.padEnd(80) + '|');
      }
    }
    
    console.log('='.repeat(80));
    
    console.log('\n📝 RESUMEN DETALLADO PARA ACTUALIZAR EN ACF:\n');
    console.log('='.repeat(80));
    
    for (const { voucher, product } of results) {
      const voucherTitle = voucher.title?.rendered || voucher.title || 'Sin título';
      const currentWooId = voucher.acf?.woo_product_id || 'No configurado';
      
      console.log(`\nVoucher: "${voucherTitle}"`);
      console.log(`  ID actual en ACF: ${currentWooId}`);
      
      if (product) {
        console.log(`  ✅ ID correcto de WooCommerce: ${product.id}`);
        console.log(`  Nombre del producto WC: "${product.name}"`);
        console.log(`  Precio: £${product.price || 'N/A'}`);
        
        if (product.id.toString() !== currentWooId?.toString()) {
          console.log(`  ⚠️  NECESITA ACTUALIZACIÓN: Cambiar de ${currentWooId} a ${product.id}`);
        }
      } else {
        console.log(`  ❌ No se encontró producto coincidente en WooCommerce`);
        console.log(`  💡 Revisa manualmente en WooCommerce > Products`);
      }
      console.log('  ' + '-'.repeat(76));
    }
    
    console.log('\n\n📋 LISTADO PARA COPIAR Y PEGAR EN ACF:\n');
    console.log('='.repeat(80));
    console.log('Voucher Name | WooCommerce Product ID');
    console.log('='.repeat(80));
    
    for (const { voucher, product } of results) {
      const voucherTitle = voucher.title?.rendered || voucher.title || 'Sin título';
      const productId = product ? product.id : 'REVISAR MANUALMENTE';
      console.log(`${voucherTitle} | ${productId}`);
    }
    
    console.log('\n✅ Proceso completado!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
