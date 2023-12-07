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
				config.extends = '../../../config/tsconfig.base.json';
				config.compilerOptions.moduleResolution = 'bundler';
				config.compilerOptions.noEmit = true;
				delete config.compilerOptions.ignoreDeprecations;
				delete config.compilerOptions.importsNotUsedAsValues;
				delete config.compilerOptions.preserveValueImports;
			},
		},
	},
	preprocess: vitePreprocess(),
});

export default config;
