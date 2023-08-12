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
				config.include?.push('../src/**/*.md');
			},
		},
	},
	preprocess: vitePreprocess(),
};

export default config;
