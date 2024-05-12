import { EOL } from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { toMarkdown } from 'mdast-util-to-markdown';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const TEMPLTATE_FILEPATH = path.resolve(__dirname, './TEMPLATE.md');
const OUTPUT_FILEPATH = path.resolve(__dirname, '../../README.md');

main();

function main() {
	const inputMarkdown = fs.readFileSync(TEMPLTATE_FILEPATH, 'utf-8');
	const processor = unified().use(remarkParse).use(codeImport);
	const tree = processor.parse(inputMarkdown);
	const transformedTree = processor.runSync(tree);
	const outputMarkdown =
		'<!--\n' +
		'    This README is generated from ./config/README/TEMPLATE.md. Do not edit it directly.\n' +
		'-->\n\n' +
		toMarkdown(/** @type {import('mdast').Nodes} */ (transformedTree));
	fs.writeFileSync(OUTPUT_FILEPATH, outputMarkdown);
}

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
function codeImport() {
	return (tree) => {
		visit(tree, 'code', (node) => {
			if (!node.meta) return;
			const fileMeta = node.meta
				// Allow escaping spaces
				.split(/(?<!\\) /g)
				.find((meta) => meta.startsWith('file='));

			if (!fileMeta) return;

			const meta = parseFileMeta(fileMeta);
			const { start, end } = meta;
			const filepath = path.resolve(
				__dirname,
				/** @type {string} */ (meta.filepath),
			);
			const content = fs.readFileSync(filepath, 'utf-8');
			const lines = extractLines(content, start, end);

			node.meta = node.meta.replace(fileMeta, '');
			node.value = lines;
		});
	};
}

/**
 * @param {string} meta
 */
function parseFileMeta(meta) {
	const [filepath, lines] = meta.replace(/^file=/, '').split('#L');

	if (!lines) return { filepath };

	const [start, end = start] = /** @type {[number, number | undefined]} */ (
		lines.split('-').map(Number)
	);
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
