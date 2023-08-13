import assert from 'node:assert';
import remarkAttributes from '../src/index.js';
import remarkParse from 'remark-parse';
import test from 'node:test';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const processor = unified().use(remarkParse).use(remarkAttributes);

test('code', async (t) => {
	await t.test('parses code attributes', async () => {
		const input = '```js {foo=bar}\n```';
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'code', (node) => {
			assert.deepStrictEqual(node.data, {
				attributes: {
					foo: 'bar',
				},
			});
			assert.strictEqual(node.meta, '');
		});
	});
	await t.test('allows preceeding whitespace', async () => {
		const input = '```js     {foo=bar}\n```';
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'code', (node) => {
			assert.deepStrictEqual(node.data, {
				attributes: {
					foo: 'bar',
				},
			});
			assert.strictEqual(node.meta, '');
		});
	});
	await t.test('ignores other meta content', async () => {
		const input = '```js  {foo=bar} meta content\n```';
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'code', (node) => {
			assert.deepStrictEqual(node.data, {
				attributes: {
					foo: 'bar',
				},
			});
			assert.strictEqual(node.meta, ' meta content');
		});
	});
	await t.test('ignores non-preceeding attributes', async () => {
		const input = '```js other {foo=bar} meta content\n```';
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'code', (node) => {
			assert.strictEqual(node.meta, 'other {foo=bar} meta content');
		});
	});
});

test('inlineCode', async (t) => {
	await t.test('parses inline code attributes', async () => {
		const input = '`foo`{bar=baz}';
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'inlineCode', (node) => {
			assert.deepStrictEqual(node.data, {
				attributes: {
					bar: 'baz',
				},
			});
		});
	});
	await t.test('cleans up next sibling', async () => {
		const input = '`foo`{bar=baz} abc';
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'inlineCode', (node, index, parent) => {
			if (typeof index === 'undefined') return; // Hush TypeScript. Hush.

			const nextSibling = parent?.children[index + 1];
			assert.deepStrictEqual(node.data, {
				attributes: {
					bar: 'baz',
				},
			});

			if (nextSibling?.type !== 'text') return; // Hush TypeScript. Hush.

			assert.strictEqual(nextSibling?.value, ' abc');
		});
	});
	await t.test('allows preceeding whitespace', async () => {
		const input = '`foo`     {bar=baz} abc';
		const parsed = processor.parse(input);
		const transformed = await processor.run(parsed);
		visit(transformed, 'inlineCode', (node, index, parent) => {
			if (typeof index === 'undefined') return; // Hush TypeScript. Hush.

			const nextSibling = parent?.children[index + 1];
			assert.deepStrictEqual(node.data, {
				attributes: {
					bar: 'baz',
				},
			});

			if (nextSibling?.type !== 'text') return; // Hush TypeScript. Hush.

			assert.strictEqual(nextSibling?.value, ' abc');
		});
	});
});
