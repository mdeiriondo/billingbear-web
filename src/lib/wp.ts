/**
 * Cliente básico para conectar Astro con la REST API de WordPress.
 * Asegúrate de que tu LocalWP esté corriendo.
 */

const WP_URL = "http://billingbear-api.local/wp-json/wp/v2"; // Ajusta a tu URL de LocalWP

export async function getHoles() {
    const res = await fetch(`${WP_URL}/holes?_embed`);
    const holes = await res.json();
    return holes;
}
    
export async function getVouchers() {
    const res = await fetch(`${WP_URL}/vouchers?_embed`);
    const vouchers = await res.json();
    return vouchers;
}

export async function getCourseStatus() {
    const res = await fetch(`${WP_URL}/courses?_embed`);
    const courses = await res.json();
    // Retornamos el estado del primer curso encontrado (ej: Old Course)
    return courses[0]?.acf?.course_status || "Open";
}

/**
 * Nota: Si usas el plugin "ACF to REST API", los campos estarán 
 * dentro de la propiedad .acf del objeto retornado.
 */