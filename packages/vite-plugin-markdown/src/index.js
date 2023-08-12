import mdAttributes from 'md-attr-parser';
import { dataToEsm } from '@rollup/pluginutils';
import delve from 'dlv';
import { EOL } from 'node:os';
import frontmatter from 'remark-frontmatter';
import fs from 'node:fs/promises';
import parse from 'remark-parse';
import stringify from 'remark-stringify';
import { unified } from 'unified';
import { EXIT, visit } from 'unist-util-visit';
import yaml from 'js-yaml';

const ATTRIBUTE_BLOCK_RE = /^\s*(\{.*?\})(\s+|$)/;

/**
 * @typedef {import('./types.js').TocEntry} TocEntry
 */

/**
 * @param {{} | null} value
 */
function isNonEmptyObject(value) {
	return (
		typeof value === 'object' && value !== null && Object.keys(value).length > 0
	);
}

/**
 * @template {Object} T
 * @param {T} thing
 * @returns {thing is Extract<T, { value: any }>}
 */
function hasValue(thing) {
	return 'value' in thing;
}

/**
 * A Vite plugin for handling Markdown files
 *
 * @returns {import('vite').Plugin}
 */
export function markdown() {
	return {
		name: 'vite-plugin-markdown',
		resolveId(id) {
			if (id.endsWith('.md')) return id;
		},
		async transform(code, id) {
			if (!id.endsWith('.md')) return;
			const vitePluginContext = this;
			const processor = unified()
				.use(parse)
				.use(stringify)
				.use(frontmatter)
				.use(remarkParseYaml)
				.use(remarkAttributes)
				.use(() => async (tree) => {
					/** @type {import('mdast').Code[]} */
					const codeBlocks = [];
					visit(tree, 'code', (node) => {
						codeBlocks.push(node);
					});

					const promises = [];
					for (const node of codeBlocks) {
						const file = node.data?.file;
						if (!file) continue;

						const { filepath, start, end } = parseFileMeta(file);
						const promise = (async () => {
							const resolution = await vitePluginContext.resolve(filepath, id);
							if (resolution) {
								const content = await fs.readFile(resolution.id, 'utf-8');
								node.value = extractLines(content, start, end);
								vitePluginContext.addWatchFile(resolution.id);
							}
						})();

						promises.push(promise);
					}

					await Promise.all(promises);
				})
				.use(() => (/** @type {import("mdast").Root} */ tree) => {
					const replacements = { ...tree.data };
					visit(tree, (node) => {
						if (!hasValue(node)) return;
						for (const match of node.value.matchAll(/{{\s*([0-9\w.]+)\s*}}/g)) {
							const path = match[1];
							const value = delve(replacements, path);
							if (value === undefined) {
								console.warn(
									`Value '${path}' accessed in '${id}' is not defined`,
								);
							}
							node.value = node.value.replace(match[0], value);
						}
					});
				})
				// Generate slugs after variables i.e. {{ stuff }} have been replaced
				.use(remarkSlugs);
			const tree = processor.parse(code);
			const transformedTree = await processor.run(tree);
			return dataToEsm(transformedTree);
		},
	};
}

const LEADING_DASH_RE = /^-+/;
const LEADING_HASH_RE = /^#+\s*/;
const NON_ALPHA_NUMERIC_RE = /[^a-z0-9]+/g;
const TRAILING_DASH_RE = /-+$/;

/**
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<void[], import('mdast').Root, import('mdast').Root>}
 */
export function remarkSlugs() {
	return (tree) => {
		/** @type {{ children: import('./types.js').TocEntry[] }} */
		const dummyRoot = { children: [] };
		const stack = [dummyRoot];

		visit(tree, 'heading', (node) => {
			if (node.depth !== 2 && node.depth !== 3) return;

			const mdString = /** @type {string} */ (this.stringify(node));
			const content =
				node.data?.content || mdString.replace(LEADING_HASH_RE, '');
			const slug =
				node.data?.slug ||
				content
					.toLowerCase()
					.replace(NON_ALPHA_NUMERIC_RE, '-')
					.replace(LEADING_DASH_RE, '')
					.replace(TRAILING_DASH_RE, '');

			/** @type {import('./types.js').TocEntry} */
			const tocEntry = {
				depth: node.depth,
				content,
				slug,
				children: [],
			};
			// Subract 1 since headings are 1-indexed
			while (stack.length > tocEntry.depth - 1) {
				stack.pop();
			}
			stack[stack.length - 1].children.push(tocEntry);
			stack.push(tocEntry);

			node.data = {
				...node.data,
				...tocEntry,
			};
		});

		tree.data = {
			...tree.data,
			tableOfContents: dummyRoot.children,
		};
	};
}

/** @type {import('unified').Plugin<void[], import('mdast').Root>} */
export function remarkParseYaml() {
	return (tree) => {
		visit(tree, 'yaml', (node) => {
			const parsedYaml = yaml.load(node.value);
			tree.data = {
				...tree.data,
				frontmatter: parsedYaml,
			};
			node.data = {
				...node.data,
				value: parsedYaml,
			};

			return EXIT;
		});
	};
}

/** @type {import('unified').Plugin<void[], import('mdast').Root>} */
export function remarkAttributes() {
	return (tree) => {
		visit(tree, 'text', (node, index, parent) => {
			// An attribute must be a sibling that follows a previous element
			if (!parent || !index) return;

			const match = node.value.match(ATTRIBUTE_BLOCK_RE);
			if (!match) return;

			const parseOutput = mdAttributes(match[1].trim());
			if (!isNonEmptyObject(parseOutput.prop)) return;

			const previousSibling = parent.children[index - 1];
			// TODO: only allow attributes on _some_ elements?
			previousSibling.data = {
				...previousSibling.data,
				...parseOutput.prop,
			};
			node.value = node.value.replace(match[1].trimEnd(), '');
		});

		visit(tree, 'code', (node) => {
			if (!node.meta) return;

			const match = node.meta.match(ATTRIBUTE_BLOCK_RE);
			if (!match) return;

			const parseOutput = mdAttributes(match[1].trim());
			if (!isNonEmptyObject(parseOutput.prop)) return;

			node.data = {
				...node.data,
				...parseOutput.prop,
			};
			node.meta = node.meta.replace(match[1].trimEnd(), '');
		});
	};
}

/**
 * @param {string} meta
 */
function parseFileMeta(meta) {
	const [filepath, lines] = meta.split('#L');

	if (!lines) return { filepath };

	/** @type {number[]} */
	const [start, end = start] = lines.split('-').map(Number);
	return { filepath, start, end };
}

/**
 * @param {string} content
 * @param {number} [start]
 * @param {number} [end]
 */
function extractLines(content, start, end) {
	const lines = content.split(EOL);
	if (!start) {
		start = 1;
		end = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
	}

	return lines.slice(start - 1, end).join('\n');
}
