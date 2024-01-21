import { sveltekit } from '@sveltejs/kit/vite';

const config = {
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['@splidejs/splide-shader-carousel']
	}
};

export default config;
