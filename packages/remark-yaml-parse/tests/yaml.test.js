import assert from 'node:assert';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkYamlParse from '../src/index.js';
import test from 'node:test';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const processor = unified()
	.use(remarkParse)
	.use(remarkFrontmatter)
	.use(remarkYamlParse);

test('yaml', async (t) => {
	await t.test('parses code attributes', async () => {
		const input = '---\nfoo: bar\n---';
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'root', (node) => {
			assert.deepStrictEqual(node.data, {
				frontmatter: {
					foo: 'bar',
				},
			});
			assert.strictEqual(node.children.length, 0);
		});
	});
});
