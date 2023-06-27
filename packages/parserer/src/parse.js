import { svelte } from '@kwangure/strawberry/code';

/**
 * @param {import('./types').ParserWithContext} parser
 * @param {string} source
 * @param {number} until
 */
export function eatUntil(parser, source, until) {
	if (parser.matches('parser.start')) {
		parser.dispatch('INIT');
	}
	for (let i = parser.context.index; i < until; i++) {
		const char = source[i];
		parser.dispatch('CHARACTER', char);
	}
}

/**
 * @param {import('./types').ParserWithContext} parser
 * @param {string} source
 */
export function parseFile(parser, source) {
	eatUntil(parser, source, source.length);
	parser.dispatch('EOF');
}

/**
 * @param {import('./types').ParserWithContext} parser
 */
export function toSvelteAST(parser) {
	return {
		html: parser.context.html.toJSON(),
	};
}

/**
 * @param {string} text
 * @param {number} index
 */
export function highlightParsed(text, index) {
	const previous = svelte(text, { from: 0, to: index });
	const current = svelte(text, { from: index, to: index + 1 });
	const next = svelte(text, { from: index + 1 });

	return [
		...previous.map((segments) => ({
			...segments,
			status: /** @type {const} */ ('previous'),
		})),
		...current.map((segments) => ({
			...segments,
			status: /** @type {const} */ ('current'),
		})),
		...next.map((segments) => ({
			...segments,
			status: /** @type {const} */ ('next'),
		})),
	];
}
