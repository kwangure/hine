import { attachComments, walk } from './index.js';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { parse as tsParse } from '@typescript-eslint/typescript-estree';

describe('walk', () => {
	it('should return early for non-object or null input', async () => {
		let callbackCalled = false;
		const callback = () => {
			callbackCalled = true;
		};

		walk(/** @type {any} */ (null), callback);
		walk(/** @type {any} */ (undefined), callback);
		walk(/** @type {any} */ (42), callback);
		walk(/** @type {any} */ ('string'), callback);

		assert.strictEqual(callbackCalled, false);
	});

	it('should apply filter to each node', async () => {
		const ast =
			/** @type {import('@typescript-eslint/typescript-estree').TSESTree.Program} */ (
				/** @type {unknown} */ ({
					type: 'Program',
					body: [{ type: 'Expression' }],
				})
			);
		let filterCallCount = 0;
		/** @type {(_node: any) => _node is import('@typescript-eslint/typescript-estree').TSESTree.Node} */
		const filter = (_node) => {
			filterCallCount++;
			return false;
		};

		walk(ast, () => {}, filter);
		assert.strictEqual(filterCallCount, 2); // Called for each node
	});

	it('should execute callback for nodes that pass filter', async () => {
		const ast =
			/** @type {import('@typescript-eslint/typescript-estree').TSESTree.Program} */ (
				/** @type {unknown} */ ({
					type: 'Program',
					body: [{ type: 'Expression' }],
				})
			);
		/** @type {(node: any) => node is import('@typescript-eslint/typescript-estree').TSESTree.Node} */
		const filter = (node) => node.type === 'Expression';
		/**
		 * @type {import("@typescript-eslint/typescript-estree").AST_NODE_TYPES[]}
		 */
		let nodes = [];
		walk(ast, (node) => nodes.push(node.type), filter);
		assert.deepStrictEqual(nodes, ['Expression']);
	});

	it('should traverse child nodes recursively', async () => {
		const ast =
			/** @type {import('@typescript-eslint/typescript-estree').TSESTree.Program} */ (
				/** @type {unknown} */ ({
					type: 'Program',
					body: [
						{
							type: 'Expression',
							children: [{ type: 'Literal' }],
						},
					],
				})
			);
		/**
		 * @type {import("@typescript-eslint/typescript-estree").AST_NODE_TYPES[]}
		 */
		let nodes = [];
		walk(ast, (node) => nodes.push(node.type));
		assert.deepStrictEqual(nodes, ['Program', 'Expression', 'Literal']);
	});

	it('should not traverse non-node objects or nodes without type property', async () => {
		const ast =
			/** @type {import('@typescript-eslint/typescript-estree').TSESTree.Node} */ (
				/** @type {unknown} */ ({
					type: 'Program',
					body: [
						{
							type: 'Expression',
							children: [{ type: 'Literal' }, { notAType: 'NotANode' }],
						},
						{
							notANode: true,
						},
					],
				})
			);
		/**
		 * @type {import("@typescript-eslint/typescript-estree").AST_NODE_TYPES[]}
		 */
		let nodes = [];
		walk(ast, (node) => nodes.push(node.type));
		assert.deepStrictEqual(nodes, ['Program', 'Expression', 'Literal']);
	});
});

describe('attachComments', () => {
	/** @param {string} code */
	const parse = (code) => tsParse(code, { comment: true, loc: true });

	it('should handle AST with no comments', () => {
		const ast = parse('let x = 5;');
		attachComments(ast);
		assert.strictEqual(ast.body[0].leadingComments, undefined);
	});

	it('should attach comment to the first node', () => {
		const ast = parse('// First comment\nlet x = 5;');
		attachComments(ast);
		assert.strictEqual(ast.body[0].leadingComments?.length, 1);
		assert.strictEqual(
			ast.body[0].leadingComments[0].value.trim(),
			'First comment',
		);
	});

	it('should attach comments to nested nodes', () => {
		const code = `function test() {\n  // Variable comment\n  let x = 5;\n}`;
		const ast = parse(code);
		attachComments(ast);
		assert.strictEqual(
			/** @type {import('@typescript-eslint/typescript-estree').TSESTree.FunctionDeclaration} */ (
				ast.body[0]
			).body.body[0].leadingComments?.length,
			1,
		);
		assert.strictEqual(
			/** @type {import('@typescript-eslint/typescript-estree').TSESTree.FunctionDeclaration} */ (
				ast.body[0]
			).body.body[0].leadingComments[0].value.trim(),
			'Variable comment',
		);
	});

	it('should handle multiple comments for the same node', () => {
		const ast = parse(
			'// First comment\n// Second comment\nlet x = 5;',
		);
		attachComments(ast);
		assert.strictEqual(
			/** @type {import('@typescript-eslint/typescript-estree').TSESTree.VariableDeclaration} */ (
				ast.body[0]
			).leadingComments?.length,
			2,
		);
	});
});

