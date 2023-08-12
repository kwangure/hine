import type { Root } from '@hinejs/vite-plugin-markdown';

declare module '*.md' {
	const ast: Root;
	export default ast;
}
