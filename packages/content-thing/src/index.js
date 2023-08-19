import { rimraf, walk, write } from '@hinejs/internal-utils/filesystem';
import { dataToEsm } from '@rollup/pluginutils';
import { EOL } from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { remarkAttributes } from '@hinejs/remark-attributes';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import { remarkVariables } from '@hinejs/remark-variables';
import remarkStringify from 'remark-stringify';
import { remarkTableOfContents } from '@hinejs/remark-toc';
import { remarkYamlParse } from '@hinejs/remark-yaml-parse';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import yaml from 'js-yaml';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const INPUT_DIR = 'src/content';
const DEV_OUTPUT_DIR = '.svelte-kit/content-thing/generated';
const NAMESPACE = 'content-thing:io';
const runtimeTemplatePath = path.join(__dirname, './runtime.js');
const RUNTIME_TEMPLATE = fs.readFileSync(runtimeTemplatePath, 'utf-8');

/**
 * A Vite plugin to handle static content
 *
 * @returns {import('vite').Plugin}
 */
export function content() {
	/** @type {string} */
	let contentDir;
	/** @type {string} */
	let root = process.cwd();
	/** @type {string} */
	let outputDir;
	/** @type {string} */
	let runtimeDir;
	/** @type {string} */
	let runtimePath;

	const processor = unified()
		.use(remarkParse)
		.use(remarkStringify)
		.use(remarkFrontmatter)
		.use(remarkYamlParse)
		.use(remarkAttributes)
		.use(remarkFileAttributes)
		.use(remarkVariables)
		.use(remarkTableOfContents);

	async function outputMarkdownESM() {
		rimraf(outputDir);
		/** @type {Record<string, Record<string, any>>} */
		const collections = {};
		let currentCollection = '';
		let currentCollectionPath = '';
		walk(contentDir, async (entry) => {
			if (entry.path === contentDir) {
				collections[entry.name] = {};
				currentCollection = entry.name;
				currentCollectionPath = path.join(entry.path, entry.name);
			}
			if (entry.name !== 'readme.md' && entry.name !== 'data.yaml') return;

			const shortpath = entry.path.slice(currentCollectionPath.length + 1);
			const filepath = path.join(entry.path, entry.name);

			let outputName = '';
			let output = '';
			switch (entry.name) {
				case 'data.yaml':
					outputName = 'output.json';
					output = yamlToJson(filepath);
					break;
				case 'readme.md':
					outputName = 'output.js';
					output = markdownToESM(filepath, processor);
					break;
			}
			const outputPath = path.join(
				outputDir,
				'collections',
				currentCollection,
				shortpath,
				entry.name,
				outputName,
			);
			write(outputPath, output);
			const relativeOutputPath = path.relative(runtimeDir, outputPath);
			collections[currentCollection][shortpath] = relativeOutputPath;
		});

		const runtime = RUNTIME_TEMPLATE.replaceAll(
			'__ENTRIES__',
			stringifyWithDynamicImports(collections),
		);
		write(runtimePath, runtime);
	}

	return {
		name: 'vite-plugin-content',
		configResolved(config) {
			if (config.root) {
				root = config.root;
			}
			contentDir = path.join(root, INPUT_DIR);
			outputDir = path.join(root, DEV_OUTPUT_DIR);
			runtimeDir = path.join(outputDir, 'io');
			runtimePath = path.join(outputDir, 'io', 'index.js');
		},
		configureServer(vite) {
			vite.watcher.on('all', (_event, filepath) => {
				if (filepath.startsWith(contentDir)) {
					outputMarkdownESM();
				}
			});
		},
		async buildStart() {
			outputMarkdownESM();
		},
		resolveId(id) {
			if (id === NAMESPACE) return runtimePath;
		},
	};
}

/**
 * @param {string} file
 * @param {import('unified').Processor} processor
 */
function markdownToESM(file, processor) {
	const code = fs.readFileSync(file);
	const vfile = new VFile({
		path: file,
		value: code,
	});
	const tree = processor.parse(vfile);
	const transformedTree = processor.runSync(tree, vfile);
	return dataToEsm(transformedTree);
}

/**
 * @param {string} file
 */
function yamlToJson(file) {
	const code = fs.readFileSync(file, 'utf-8');
	const json = yaml.load(code);
	return JSON.stringify(json, null, 4);
}

/**
 * Processes `file` attributes
 *
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<void[], import('mdast').Root, import('mdast').Root>}
 */
export function remarkFileAttributes() {
	return (tree, vfile) => {
		/** @type {import('mdast').Code[]} */
		const codeBlocks = [];
		visit(tree, 'code', (node) => {
			codeBlocks.push(node);
		});
		for (const node of codeBlocks) {
			const file = node.data?.attributes.file;
			if (!file) continue;

			let { filepath, start, end } = parseFileMeta(file);
			const { dirname } = vfile;

			if (filepath[0] !== '/' && dirname) {
				filepath = path.join(dirname, filepath);
			}

			const content = fs.readFileSync(filepath, 'utf-8');
			node.value = extractLines(content, start, end);
		}
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

/**
 * @param {Record<string, any>} obj
 */
function stringifyWithDynamicImports(obj) {
	let result = '{\n';

	for (const [key, value] of Object.entries(obj)) {
		result += `    "${key}": {\n`;
		for (const [subKey, subValue] of Object.entries(value)) {
			result += `        "${subKey}": () => import("${subValue}"),\n`;
		}
		result = result.slice(0, -2); // Remove the trailing comma and newline
		result += '\n    },\n';
	}

	result = result.slice(0, -2); // Remove the trailing comma and newline
	result += '\n}';

	return result;
}

/**
 * @typedef {import('./types.js').TocEntry} TocEntry
 */
