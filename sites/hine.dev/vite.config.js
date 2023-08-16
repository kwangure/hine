import { sveltekit } from '@sveltejs/kit/vite';
import { content } from '@hinejs/content-thing';
import { defineConfig } from 'vitest/config';
import { markdown } from '@hinejs/vite-plugin-markdown';

export default defineConfig({
	plugins: [content(), markdown(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
