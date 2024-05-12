import adapter from '@sveltejs/adapter-auto';
import { extendSvelteConfig } from 'content-thing';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		typescript: {
			config(config) {
				config.extends = '../../../config/tsconfig.base.json';
			},
		},
	},
};

export default extendSvelteConfig(config);
