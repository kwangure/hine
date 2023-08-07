import mdAttributes from 'md-attr-parser';
import { dataToEsm } from '@rollup/pluginutils';
import delve from 'dlv';
import { EOL } from 'node:os';
import frontmatter from 'remark-frontmatter';
import fs from 'node:fs/promises';
import parse from 'remark-parse';
import { unified } from 'unified';
import { EXIT, visit } from 'unist-util-visit';
import yaml from 'js-yaml';

/**
 * @typedef {import('mdast').Code & { properties?: { file?: string, lang?: string } & Record<string, any>}} Code
 * @typedef {import('mdast').Heading} Heading
 * @typedef {import('mdast').InlineCode & { properties?: { lang?: string }}} InlineCode
 * @typedef {import('mdast').List} List
 * @typedef {import('mdast').Literal} Literal
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast').Parent} Parent
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Text} Text
 * @typedef {import('mdast').YAML & { data: any }} FrontMatter
 */

const ATTRIBUTE_BLOCK_RE = /^\s*(\{.*?\})(\s+|$)/;
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
				.use(frontmatter)
				.use(remarkParseYaml)
				.use(remarkAttributes)
				.use(() => async (/** @type {Root} */ tree) => {
					/**
					 * @typedef {import('type-fest').SetRequired<Code, "properties">} CodeWithProperties
					 */

					/** @type {CodeWithProperties[]} */
					const codeBlocks = [];
					visit(tree, 'code', (node) => {
						if ('properties' in /** @type {Code} */ (node)) {
							codeBlocks.push(/** @type {CodeWithProperties} */ (node));
						}
					});

					const promises = [];
					for (const node of codeBlocks) {
						const { file } = node.properties;
						if (!file) continue;

						const { filepath, start, end } = parseFileMeta(file);
						const promise = (async () => {
							const resolution = await vitePluginContext.resolve(filepath, id);
							if (resolution) {
								const content = await fs.readFile(resolution.id, 'utf-8');
								node.value = extractLines(content, start, end);
							}
						})();

						promises.push(promise);
					}

					await Promise.all(promises);
				})
				.use(() => (tree) => {
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
				});
			const tree = processor.parse(code);
			const transformedTree = await processor.run(tree);
			return dataToEsm(transformedTree);
		},
	};
}

/** @type {import('unified').Plugin<void[], import('mdast').Root>} */
export function remarkParseYaml() {
	return (tree) => {
		visit(tree, 'yaml', (node) => {
			tree.data = {
				frontmatter: yaml.load(node.value),
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
			// @ts-expect-error
			// TODO: only allow attributes on _some_ elements?
			previousSibling.properties = parseOutput.prop;
			node.value = node.value.replace(match[1].trimEnd(), '');
		});

		visit(tree, 'code', (node) => {
			if (!node.meta) return;

			const match = node.meta.match(ATTRIBUTE_BLOCK_RE);
			if (!match) return;

			const parseOutput = mdAttributes(match[1].trim());
			if (!isNonEmptyObject(parseOutput.prop)) return;

			/** @type {Code} */ (node).properties = parseOutput.prop;
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
