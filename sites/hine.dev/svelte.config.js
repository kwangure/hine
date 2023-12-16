import adapter from '@sveltejs/adapter-auto';
import { extendSvelteConfig } from 'content-thing';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = extendSvelteConfig({
	kit: {
		adapter: adapter(),
		typescript: {
			config(config) {
				config.include.push(
					'../svelte.config.js',
					'../scripts/**/*.js',
					'../scripts/**/*.ts',
				);
				config.extends = '../../../config/tsconfig.base.json';
			},
		},
	},
	preprocess: vitePreprocess(),
});

export default config;
