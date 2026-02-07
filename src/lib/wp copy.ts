/**
 * Cliente básico para conectar Astro con la REST API de WordPress.
 */

// Usar variable de entorno o fallback a producción
const WP_BASE_URL = import.meta.env.WORDPRESS_URL || "https://billingbearpark.com";
const WP_URL = `${WP_BASE_URL}/wp-json/wp/v2`;

// TTL de caché en milisegundos (5 minutos)
const CACHE_TTL = 300000;

// Cachés en memoria
let vouchersCache: any = null;
let vouchersLastFetch = 0;

let coursesCache: any = null;
let coursesLastFetch = 0;


export async function getCourses() {
  try {
    const res = await fetch(`${WP_URL}/courses?_embed&per_page=100`);
    if (!res.ok) {
      console.error(`WordPress API error: ${res.status} ${res.statusText}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export async function getCourseBySlug(slug: string) {
  const res = await fetch(`${WP_URL}/courses?slug=${slug}&_embed`);
  const courses = await res.json();
  return courses[0];
}

export async function getHoles(courseId?: number) {
  // Si pasamos un ID de curso, filtramos por ese curso.
  // En WP Headless, solemos usar un parámetro de filtro o categoría.
  let url = `${WP_URL}/holes?_embed&per_page=100`;
  if (courseId) url += `&course=${courseId}`;
  const res = await fetch(url);
  return await res.json();
}

export async function getVouchers() {
  try {
    const res = await fetch(`${WP_URL}/vouchers?_embed`);
    if (!res.ok) {
      console.error(`WordPress API error: ${res.status} ${res.statusText}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return [];
  }
}

export async function getCourseStatus() {
  try {
    const res = await fetch(`${WP_URL}/courses?_embed`);
    if (!res.ok) {
      console.error(`WordPress API error: ${res.status} ${res.statusText}`);
      return "Open";
    }
    const courses = await res.json();
    return courses[0]?.acf?.course_status || "Open";
  } catch (error) {
    console.error('Error fetching course status:', error);
    return "Open";
  }
}
