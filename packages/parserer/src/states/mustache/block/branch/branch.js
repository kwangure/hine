import { createNameMonitor, createNameState } from './name.js';
import { createBeforeState } from './before.js';
import { h } from 'hine';

export function createBranchState() {
	return h.compound({
		conditions: {
			isDone: h.condition(({ ownerState }) =>
				Boolean(ownerState?.matches('branch.done')),
			),
		},
		on: {
			CHARACTER: [
				{
					transitionTo: 'done',
					condition: 'isDone',
				},
			],
		},
		states: {
			before: createBeforeState(),
			name: createNameState(),
			done: h.atomic(),
		},
	});
}

/**
 * @param {import('$types').ParserContext} context
 */
export function createBranchMonitor(context) {
	return {
		actions: {
			finalizeBlockStatement: h.action(() => {
				const closingTag = context.stack.pop({ expect: ['BlockStatement'] });
				const parentBlock = context.stack.peek({ expect: ['Block'] });
				parentBlock.append(closingTag);

				parentBlock.end = context.index + 1;
				closingTag.end = context.index + 1;
			}),
		},
		states: {
			name: createNameMonitor(),
		},
	};
}
