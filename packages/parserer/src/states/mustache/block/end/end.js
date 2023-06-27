import { createNameMonitor, createNameState } from './name.js';
import { createBeforeState } from './before.js';
import { h } from 'hine';

export function createEndState() {
	return h.compound({
		conditions: {
			isDone: h.condition(({ ownerState }) =>
				Boolean(ownerState?.matches('end.done')),
			),
		},
		on: {
			CHARACTER: [
				{
					transitionTo: 'done',
					condition: 'isDone',
					actions: ['finalizeBlockStatement', 'finalizeBlock'],
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
export function createEndMonitor(context) {
	return {
		actions: {
			finalizeBlockStatement: h.action(() => {
				const closingTag = context.stack.pop({ expect: ['BlockStatement'] });
				const parentBlock = context.stack.peek({ expect: ['Block'] });
				const openingTag = parentBlock.children[0];

				if (closingTag.name !== openingTag.name) {
					throw Error(
						`Expected closing tag name '${closingTag.name}' to match opening tag name '${openingTag.name}'`,
					);
				}

				parentBlock.append(closingTag);
				parentBlock.end = context.index + 1;
			}),
		},
		states: {
			name: createNameMonitor(),
		},
	};
}
