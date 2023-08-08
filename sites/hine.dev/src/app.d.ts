import type { Root } from '@hinejs/vite-plugin-markdown';

// See https://kit.svelte.dev/docs/types#app for more info
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module '*.md' {
	const ast: Root;
	export default ast;
}

export {};
