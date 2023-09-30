import { sveltekit } from '@sveltejs/kit/vite';
import { content } from 'content-thing2';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [content(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
