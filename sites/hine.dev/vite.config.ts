import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { content } from 'content-thing';

export default defineConfig({
	plugins: [content(), sveltekit()],
	ssr: {
		external: ['content-thing'],
	},
	test: {
		environment: 'jsdom',
	},
});
