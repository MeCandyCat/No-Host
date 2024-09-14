import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte'],
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter(),
		paths: {
			base: ''
		}
	},
	vite: {
		build: {
			chunkSizeWarningLimit: 1000
		}
	}
};

export default config;
