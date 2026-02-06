/**
 * Script para obtener los IDs correctos de WooCommerce para cada voucher
 * Ejecutar con: node scripts/get-voucher-woo-ids.mjs
 * 
 * Requiere: dotenv para cargar variables de entorno
 * npm install dotenv (si no está instalado)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return envVars;
  } catch (error) {
    console.log('⚠️  No se pudo cargar .env, usando variables de entorno del sistema');
    return {};
  }
}

const env = loadEnv();

const WOOCOMMERCE_URL = env.WOOCOMMERCE_URL || process.env.WOOCOMMERCE_URL || 'https://billingbearpark.com';
const WOOCOMMERCE_CONSUMER_KEY = env.WOOCOMMERCE_CONSUMER_KEY || process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const WOOCOMMERCE_CONSUMER_SECRET = env.WOOCOMMERCE_CONSUMER_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
const WP_URL = env.WP_URL || process.env.WP_URL || 'https://billingbearpark.com/wp-json/wp/v2';

function createAuthHeader(consumerKey, consumerSecret) {
  const credentials = `${consumerKey}:${consumerSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

async function getVouchers() {
  try {
    console.log(`📡 Obteniendo vouchers desde: ${WP_URL}/vouchers`);
    const res = await fetch(`${WP_URL}/vouchers?_embed&per_page=100`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const vouchers = await res.json();
    return vouchers;
  } catch (error) {
    console.error('❌ Error obteniendo vouchers:', error.message);
    // Intentar con URL local como fallback
    const localUrl = 'http://billingbear-api.local/wp-json/wp/v2';
    console.log(`⚠️  Intentando con URL local: ${localUrl}`);
    try {
      const res = await fetch(`${localUrl}/vouchers?_embed&per_page=100`);
      return await res.json();
    } catch (localError) {
      throw new Error(`No se pudo conectar ni a producción ni a local: ${error.message}`);
    }
  }
}

async function getWooCommerceProducts() {
  const apiUrl = `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100`;

  if (!WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
    throw new Error('WooCommerce credentials not configured. Please set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET in .env');
  }

  console.log(`📡 Obteniendo productos desde: ${apiUrl}`);
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': createAuthHeader(WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET)
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return await response.json();
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findMatchingProduct(voucherTitle, products) {
  const normalizedVoucher = normalizeName(voucherTitle);
  
  // Intentar match exacto primero
  for (const product of products) {
    const normalizedProduct = normalizeName(product.name);
    if (normalizedVoucher === normalizedProduct) {
      return product;
    }
  }
  
  // Intentar match parcial
  for (const product of products) {
    const normalizedProduct = normalizeName(product.name);
    if (normalizedVoucher.includes(normalizedProduct) || normalizedProduct.includes(normalizedVoucher)) {
      return product;
    }
  }
  
  // Intentar match por palabras clave comunes
  const voucherWords = normalizedVoucher.split(' ').filter(w => w.length > 3);
  for (const product of products) {
    const normalizedProduct = normalizeName(product.name);
    const productWords = normalizedProduct.split(' ').filter(w => w.length > 3);
    const commonWords = voucherWords.filter(word => productWords.includes(word));
    if (commonWords.length >= 2) {
      return product;
    }
  }
  
  return null;
}

async function main() {
  console.log('🔍 Obteniendo vouchers desde WordPress...\n');
  
  try {
    const vouchers = await getVouchers();
    console.log(`✅ Encontrados ${vouchers.length} vouchers\n`);
    
    console.log('🔍 Obteniendo productos de WooCommerce...\n');
    const products = await getWooCommerceProducts();
    console.log(`✅ Encontrados ${products.length} productos de WooCommerce\n`);
    
    console.log('📋 LISTADO DE VOUCHERS Y SUS IDs DE WOOCOMMERCE:\n');
    console.log('='.repeat(100));
    console.log('| Voucher Name'.padEnd(55) + '| WooCommerce Product ID | Match Status |');
    console.log('='.repeat(100));
    
    const results = [];
    
    for (const voucher of vouchers) {
      const voucherTitle = voucher.title?.rendered || voucher.title || 'Sin título';
      const currentWooId = voucher.acf?.woo_product_id || 'No configurado';
      const matchingProduct = findMatchingProduct(voucherTitle, products);
      
      results.push({ voucher, product: matchingProduct });
      
      const status = matchingProduct 
        ? (matchingProduct.id.toString() === currentWooId?.toString() ? '✅ Correcto' : '⚠️  Diferente')
        : '❌ No encontrado';
      
      const productId = matchingProduct ? matchingProduct.id : 'N/A';
      
      console.log(`| ${voucherTitle.substring(0, 53).padEnd(53)} | ${productId.toString().padEnd(21)} | ${status.padEnd(12)} |`);
    }
    
    console.log('='.repeat(100));
    
    console.log('\n📝 RESUMEN DETALLADO PARA ACTUALIZAR EN ACF:\n');
    console.log('='.repeat(100));
    
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
      console.log('  ' + '-'.repeat(96));
    }
    
    console.log('\n\n📋 LISTADO PARA COPIAR Y PEGAR EN ACF:\n');
    console.log('='.repeat(100));
    console.log('Voucher Name | WooCommerce Product ID');
    console.log('='.repeat(100));
    
    for (const { voucher, product } of results) {
      const voucherTitle = voucher.title?.rendered || voucher.title || 'Sin título';
      const productId = product ? product.id : 'REVISAR MANUALMENTE';
      console.log(`${voucherTitle} | ${productId}`);
    }
    
    console.log('\n\n📦 TODOS LOS PRODUCTOS DISPONIBLES EN WOOCOMMERCE:\n');
    console.log('='.repeat(100));
    console.log('ID  | Nombre del Producto | Precio');
    console.log('='.repeat(100));
    
    products.forEach(product => {
      const name = product.name.substring(0, 60).padEnd(60);
      const price = `£${product.price || 'N/A'}`.padEnd(10);
      console.log(`${product.id.toString().padEnd(3)} | ${name} | ${price}`);
    });
    
    console.log('\n💡 Si algún voucher no tiene match automático, revisa la lista de productos arriba');
    console.log('   y actualiza manualmente el campo "woo_product_id" en ACF para ese voucher.\n');
    
    console.log('✅ Proceso completado!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
