import { EOL } from 'node:os';
import fs from 'fs';
import parse from 'remark-parse';
import stringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

main();

async function main() {
	const readme = fs.readFileSync('./README_TEMPLATE.md', 'utf-8');
	const file = await unified()
		.use(parse)
		.use(codeImport)
		.use(stringify)
		.process(readme);
	const banner = [
		'<!--',
		'    This README is generated from ./README_TEMPLATE.md. Do not edit it directly.',
		'-->\n\n',
	].join('\n');
	fs.writeFileSync('./README.md', `${banner}${file}`);
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

			const { filepath, start, end } = parseFileMeta(fileMeta);
			const content = fs.readFileSync(filepath, 'utf-8');
			const lines = extractLines(content, start, end);

			node.meta = node.meta.replace(fileMeta, '');
			node.value = lines;
		});
	};
}

function parseFileMeta(meta) {
	const [filepath, lines] = meta.replace(/^file=/, '').split('#L');

	if (!lines) return { filepath };

	const [start, end = start] = lines.split('-').map(Number);
	return { filepath, start, end };
}

function extractLines(content, start, end) {
	const lines = content.split(EOL);
	if (!start) {
		start = 1;
		end = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
	}
	return lines.slice(start - 1, end).join('\n');
}
