import { highlightTree, tagHighlighter, tags } from '@lezer/highlight';

const colors = tagHighlighter([
	{ tag: tags.link, class: 'tok-link' },
	{ tag: tags.heading, class: 'tok-heading' },
	{ tag: tags.emphasis, class: 'tok-emphasis' },
	{ tag: tags.strong, class: 'tok-strong' },
	{ tag: tags.keyword, class: 'tok-keyword' },
	{ tag: tags.definitionKeyword, class: 'tok-definition-keyword' },
	{ tag: tags.operatorKeyword, class: 'tok-operator-keyword' },
	{ tag: tags.atom, class: 'tok-atom' },
	{ tag: tags.bool, class: 'tok-bool' },
	{ tag: tags.url, class: 'tok-url' },
	{ tag: tags.labelName, class: 'tok-label-name' },
	{ tag: tags.inserted, class: 'tok-inserted' },
	{ tag: tags.deleted, class: 'tok-deleted' },
	{ tag: tags.literal, class: 'tok-literal' },
	{ tag: tags.string, class: 'tok-string' },
	{ tag: tags.number, class: 'tok-number' },
	{
		tag: [tags.regexp, tags.escape, tags.special(tags.string)],
		class: 'tok-string2',
	},
	{ tag: tags.variableName, class: 'tok-variable-name' },
	{ tag: tags.local(tags.variableName), class: 'tok-variable-name tok-local' },
	{ tag: tags.special(tags.variableName), class: 'tok-variable-name2' },
	{
		tag: tags.definition(tags.propertyName),
		class: 'tok-property-name toke-definition',
	},
	{
		tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
		class: 'tok-function-name',
	},
	{ tag: tags.typeName, class: 'tok-type-name' },
	{ tag: tags.namespace, class: 'tok-namespace' },
	{ tag: tags.className, class: 'tok-classname' },
	{ tag: tags.macroName, class: 'tok-macro-name' },
	{ tag: tags.propertyName, class: 'tok-property-name' },
	{ tag: tags.operator, class: 'tok-operator' },
	{ tag: tags.comment, class: 'tok-comment' },
	{ tag: tags.meta, class: 'tok-meta' },
	{ tag: tags.invalid, class: 'tok-invalid' },
	{ tag: tags.punctuation, class: 'tok-punctuation' },
]);

/**
 * @param {import('@lezer/lr').LRParser} parser
 * @param {string} code
 * @param {Object} [options]
 * @param {number} [options.from]
 * @param {number} [options.to]
 */
export function highlight(parser, code, options = {}) {
	const parsed = parser.parse(code);
	const { from = 0, to = parsed.length } = options;
	let lastEnd = from;
	const highlighted = [];
	highlightTree(
		parsed,
		colors,
		(from, to, color) => {
			highlighted.push({ color: '', segment: code.slice(lastEnd, from) });
			highlighted.push({ color, segment: code.slice(from, to) });
			lastEnd = to;
		},
		from,
		to,
	);

	highlighted.push({ color: '', segment: code.slice(lastEnd, to) });

	return highlighted.filter(({ segment }) => segment);
}

/**
 * @param {string} code
 * @param {import('./language.js').Highlighter} [highlighLanguage]
 */
export function highlightLines(code, highlighLanguage) {
	const sourceLines = code.split('\n');
	if (!highlighLanguage)
		return sourceLines.map((line) => {
			return [{ color: '', segment: line }];
		});

	let pos = 0;
	return sourceLines.map((line) => {
		const highlighted = highlighLanguage(code, {
			from: pos,
			to: pos + line.length + 1, // add 1 to account for the removed \n
		});
		pos += line.length + 1;
		return highlighted;
	});
}
