import { sveltekit } from '@sveltejs/kit/vite';
import { content } from 'content-thing';
import { defineConfig } from 'vitest/config';
import { reference } from './scripts/vite-plugin-reference/index.js';

export default defineConfig({
	plugins: [content(), sveltekit(), reference()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
