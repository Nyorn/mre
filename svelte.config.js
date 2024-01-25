import netlify from '@sveltejs/adapter-netlify';

const config = {
	kit: {
		adapter: netlify(), // Используйте адаптер Netlify
		prerender: {
			entries: [
				'/',
				'/objects',
				'/objects/studiya-izida-palas',
				'/objects/apartamenty-v-byala2',
				'/objects/apartamenty-v-byala',
				'/objects/studiya-v-byala',
				'/objects/apartamenty-sanraiz2',
				'/objects/apartamenty-byala',
				'/objects/apartamenty-obzor',
				'/objects/apartamenty-sanraiz',
				'/objects/apartamenty-fortuna-keip',
				'/objects/cascades',
				'/objects/elitoniya',
				'/objects/admiral-plaza',
				'/objects/khavana-vlas',
				'/objects/mezonet-galeriya',
				'/objects/obzor-chernomorska',
				'/objects/zolotye-peski',
				'/objects/diamant',
				'/objects/vip-style',
				'/objects/revierra-fort-1-line',
				'/objects/dolche-vita-2'
			]
		}
	}
};

export default config;
