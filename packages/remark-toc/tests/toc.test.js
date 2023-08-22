import { describe, it } from 'node:test';
import assert from 'node:assert';
import remarkStringify from 'remark-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import remarkTableOfContents from '../src/index.js';

const processor = unified()
	.use(remarkParse)
	.use(remarkStringify)
	.use(remarkFrontmatter)
	.use(remarkTableOfContents)
	.freeze();

describe('toc', () => {
	it('creates toc from headings', async () => {
		const input = `## h2-1\n## h2-2\nparagraph\n### h3-1`;
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'root', (node) => {
			assert.deepEqual(node.data, {
				tableOfContents: [
					{
						children: [],
						value: 'h2-1\n',
						depth: 2,
						id: 'h2-1',
						hash: '#h2-1',
					},
					{
						children: [
							{
								children: [],
								value: 'h3-1\n',
								depth: 3,
								id: 'h3-1',
								hash: '#h3-1',
							},
						],
						value: 'h2-2\n',
						depth: 2,
						id: 'h2-2',
						hash: '#h2-2',
					},
				],
			});
		});
	});
	it('creates toc without headings', async () => {
		const input = `paragraph-1\n\nparagraph-2`;
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'root', (node) => {
			assert.deepEqual(node.data, {
				tableOfContents: [],
			});
		});
	});
});
