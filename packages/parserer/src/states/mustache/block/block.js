import { createBranchMonitor, createBranchState } from './branch/branch.js';
import { createEndMonitor, createEndState } from './end/end.js';
import { createNameMonitor, createNameState } from './name.js';
import { createRawMonitor, createRawState } from './raw.js';
import { PBlock, PBlockStatement } from '../../../nodes.js';
import { h } from 'hine';

/**
 * @param {import('$types').ParserContext} context
 */
export function createBlockState(context) {
	return h.compound({
		conditions: {
			isDone: h.condition(({ ownerState }) =>
				Boolean(ownerState?.matches('block.done')),
			),
		},
		on: {
			CHARACTER: [
				{
					transitionTo: 'done',
					condition: 'isDone',
				},
			],
			RESET: [
				{
					actions: ['resetBlock', 'resetBlockStatement'],
				},
			],
		},
		states: {
			start: h.atomic({
				always: [
					{
						transitionTo: 'name',
						condition: 'isHashTag',
					},
					{
						transitionTo: 'branch',
						condition: 'isColon',
					},
					{
						transitionTo: 'end',
						condition: 'isForwardSlash',
					},
				],
			}),
			branch: createBranchState(),
			name: createNameState(),
			end: createEndState(),
			raw: createRawState(context),
			done: h.atomic(),
		},
	});
}

/**
 * @param {import('$types').ParserContext} context
 */
export function createBlockMonitor(context) {
	/** @type {PBlock} */
	let block;
	/** @type {PBlockStatement} */
	let blockStatement;
	return {
		actions: {
			addBlockStatementName: h.action({
				run({ value }) {
					blockStatement.name += value;
					blockStatement.end = context.index + 1;
				},
			}),
			addBlockStatementEnd: h.action(
				() => (blockStatement.end = context.index + 1),
			),
			initializeBlock: h.action({
				run() {
					block = new PBlock();
					block.start = context.index - 1;
					block.end = context.index + 1;
					context.stack.push(block);
				},
			}),
			initializeBlockStatement: h.action({
				run() {
					blockStatement = new PBlockStatement();
					blockStatement.start = context.index - 1;
					blockStatement.end = context.index + 1;
					context.stack.push(blockStatement);
				},
			}),
			finalizeBlock: h.action(() => {
				const block = context.stack.pop({ expect: ['Block'] });
				block.end = context.index + 1;

				const blockParent = context.stack.peek({
					expect: ['BlockStatement', 'Fragment', 'Element'],
				});
				blockParent.append(block);
				blockParent.end = context.index + 1;
			}),
			resetBlock: h.action({
				run() {
					block.clear();
					// We know it's not undefined in all other places since `initialize`
					// runs first. Set to `undefined` so that GC can cleanup.
					// @ts-expect-error
					block = undefined;
				},
			}),
			resetBlockStatement: h.action({
				run() {
					blockStatement.clear();
					// We know it's not undefined in all other places since `initialize`
					// runs first. Set to `undefined` so that GC can cleanup.
					// @ts-expect-error
					blockStatement = undefined;
				},
			}),
		},
		states: {
			branch: createBranchMonitor(context),
			end: createEndMonitor(context),
			name: createNameMonitor(),
			raw: createRawMonitor(context),
		},
	};
}
