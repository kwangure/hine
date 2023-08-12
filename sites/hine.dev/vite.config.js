import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { markdown } from '@hinejs/vite-plugin-markdown';

export default defineConfig({
	plugins: [markdown(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
