import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		files: {
			/**
			 * Get type errors when we try to use `$lib/path/to/file`. It's a
			 * small price to pay so that we don't need wait for
			 * `@sveltejs/package` to resolve them and get instant HMR etc. for
			 * other packages that depend on this one.
			 */
			lib: '/see-svelte-config',
		},
	},
	preprocess: vitePreprocess(),
};

export default config;
