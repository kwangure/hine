import adapter from '@sveltejs/adapter-auto';
import { extendSvelteConfig } from 'content-thing';
import { vitePreprocess } from '@sveltejs/kit/vite';

const config = extendSvelteConfig({
	kit: {
		adapter: adapter(),
	},
	preprocess: vitePreprocess(),
});

export default config;
