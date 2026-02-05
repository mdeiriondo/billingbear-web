/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				brand: {
					green: '#1A3C34', // Heritage Green
					gold: '#C8A97E',  // Muted Gold
					cream: '#F4F2ED', // Paper Background
					dark: '#1F1F1F',  // Charcoal Text
					stone: '#E5E5E0', // Borders
				}
			},
			fontFamily: {
				serif: ['"Playfair Display"', 'serif'],
				sans: ['"Inter"', 'sans-serif'],
			}
		},
	},
	plugins: [],
}
