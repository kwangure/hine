import { rimraf, walk, write } from '@hinejs/internal-utils/filesystem';
import { dataToEsm } from '@rollup/pluginutils';
import fs from 'node:fs';
import path from 'node:path';
import { remarkAttributes } from '@hinejs/remark-attributes';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import { remarkVariables } from '@hinejs/remark-variables';
import remarkStringify from 'remark-stringify';
import { remarkYamlParse } from '@hinejs/remark-yaml-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const INPUT_DIR = 'src/docs';
const OUTPUT_DIR = '.svelte-kit/content-thing/generated';
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
	let runtimePath;

	const processor = unified()
		.use(remarkParse)
		.use(remarkStringify)
		.use(remarkFrontmatter)
		.use(remarkYamlParse)
		.use(remarkAttributes)
		.use(remarkVariables)
		.use(remarkTableOfContents);

	async function outputMarkdownESM() {
		rimraf(outputDir);
		/** @type {string[]} */
		const outputs = [];
		walk(contentDir, async (entry) => {
			if (entry.name === 'readme.md') {
				const shortpath = entry.path.slice(contentDir.length + 1);
				// ouputs are used synchronously. do them first.
				const dest = path.join(outputDir, shortpath, entry.name, 'output.js');
				outputs.push(`\t"${shortpath}": () => import('${dest}'),`);

				const filepath = path.join(entry.path, entry.name);
				const ast = await markdownToESM(filepath, processor);
				write(dest, ast);
			}
		});

		const runtime = RUNTIME_TEMPLATE.replaceAll(
			'__ENTRIES__',
			`{\n${outputs.join('\n')}\n}`,
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
			outputDir = path.join(root, OUTPUT_DIR);
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
async function markdownToESM(file, processor) {
	const markdown = fs.readFileSync(file, 'utf8');
	const tree = processor.parse(markdown);
	const transformedTree = await processor.run(tree);
	return dataToEsm(transformedTree);
}

const LEADING_DASH_RE = /^-+/;
const LEADING_HASH_RE = /^#+\s*/;
const NON_ALPHA_NUMERIC_RE = /[^a-z0-9]+/g;
const TRAILING_DASH_RE = /-+$/;

// TODO: extract and test
/**
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<void[], import('mdast').Root, import('mdast').Root>}
 */
export function remarkTableOfContents() {
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
