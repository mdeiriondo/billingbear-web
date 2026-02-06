/**
 * Cliente básico para conectar Astro con la REST API de WordPress.
 */

// Usar variable de entorno o fallback a producción
const WP_BASE_URL = import.meta.env.WORDPRESS_URL || "https://billingbearpark.com";
const WP_URL = `${WP_BASE_URL}/wp-json/wp/v2`;

export async function getCourses() {
  const res = await fetch(`${WP_URL}/courses?_embed&per_page=100`);
  return await res.json();
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
  const res = await fetch(`${WP_URL}/vouchers?_embed`);
  return await res.json();
}

export async function getCourseStatus() {
  const res = await fetch(`${WP_URL}/courses?_embed`);
  const courses = await res.json();
  return courses[0]?.acf?.course_status || "Open";
}
