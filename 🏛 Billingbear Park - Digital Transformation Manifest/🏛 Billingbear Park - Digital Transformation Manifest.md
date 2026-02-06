# 🏛 Billingbear Park - Digital Transformation Manifest

> **Uso:** Este archivo es el núcleo de contexto para Gemini y Cursor. Debe actualizarse tras cada hito importante.

## 1. Visión Estratégica ("Heritage Modern")

- **Concepto:** Pasar de un "Pay & Play" municipal a un "Royal Landscape" con historia de 1086 (Domesday Book).
- **Diseño:** - **Colores:** Heritage Green (#1A3C34), Paper Cream (#F4F2ED), Muted Gold (#C8A97E).
    - **Tipografía:** Playfair Display (Serif/Historia) e Inter (Sans/Moderna).
- **Diferenciador:** Resaltar el diseño de Martin Hawtree (1989) y la conexión con Shakespeare/Tudor.

## 2. Arquitectura Técnica (Stack)

- **Frontend:** Astro 5 (Arquitectura de Islas).
- **Styling:** Tailwind CSS 4 (Configuración CSS-first).
- **Interactividad:** React (para widgets dinámicos como Weather y Modales).
- **CMS:** Headless WordPress (WP REST API).
- **E-commerce:** Migración de WooCommerce pesado a Stripe/Payment Links (vía WordPress ACF).

## 3. Implementaciones Realizadas (Log)

### A. Core & Layout

- [x] Estructura de Astro con Tailwind 4 configurado en `global.css`.
- [x] Layout principal con fuentes de Google optimizadas.
- [x] Header "Command Centre" adaptativo (transparente -> sticky verde) con sistema de "Reveal" para Course Status.

### B. Páginas (Templates)

- [x] **Home:** Bento Grid de Vouchers, Hero inmersivo, Notice Board estilo clubhouse.
- [x] **Course Details:** Scorecard técnico, Pro Tips, Slider de hoyos (React) y sección Flyover.
- [x] **History:** Narrativa visual de 1086 a 1989.
- [x] **Events:** Landing de bodas/eventos con paquetes de catering (Palmer, Nicklaus, Faldo).
- [x] **Contact:** Info de localización rápida y formulario técnico.

### C. Widgets & Islas (React)

- [x] **WeatherWidget:** Consumo de Open-Meteo API con backoff exponencial y link a Meteoblue (Headland).
- [x] **HoleSlider:** Navegación por hoyos con snap horizontal e indicadores.
- [ ] *[Cursor Log: Añade aquí lo que desarrolles en Cursor]*

## 4. Estructura de Datos (WordPress Headless)

- **CPT Courses:** Incluye `total_par`, `total_yards`, `historical_context`.
- **CPT Holes:** Relacionado por ID a Course, incluye `pro_tip`, `yards`, `par`, `drone_video_url`.
- **CPT Vouchers:** Conexión vía `woo_product_id` para links de pago directos.

## 5. Instrucciones para el Informe Final

Cuando el desarrollo termine, el informe debe cubrir:

1. **Auditoría de Performance:** Comparativa de velocidad (Sitio viejo vs Astro).
2. **SEO Strategy:** Cómo el contenido histórico (Shakespeare, Tudor) atrae tráfico orgánico.
3. **Mantenibilidad:** Cómo el cliente edita en WordPress y la web se actualiza sola.
4. **UX Report:** Justificación del "Reveal System" para el estado de los campos sobre suelo arcilloso.