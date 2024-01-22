import netlify from '@sveltejs/adapter-netlify';

const config = {
	kit: {
		adapter: netlify(), // Используйте адаптер Netlify
		// Оставьте остальные конфигурации как есть, если они вам нужны
	}
};

export default config;
