import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$docs: './src/docs',
		},
		typescript: {
			config(config) {
				config.compilerOptions.paths['content-thing:io'] = [
					'./content-thing/generated/io/index.js',
				];
			},
		},
	},
	preprocess: vitePreprocess(),
};

export default config;
