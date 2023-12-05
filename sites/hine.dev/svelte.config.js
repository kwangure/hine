import adapter from '@sveltejs/adapter-auto';
import { extendSvelteConfig } from 'content-thing';
import { vitePreprocess } from '@sveltejs/kit/vite';

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
			},
		},
	},
	preprocess: vitePreprocess(),
});

export default config;
