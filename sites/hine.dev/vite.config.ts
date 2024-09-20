import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { content } from 'content-thing';

export default defineConfig({
	plugins: [content(), sveltekit()],
	test: {
		environment: 'jsdom',
	},
});
