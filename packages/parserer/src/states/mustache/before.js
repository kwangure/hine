import { h } from 'hine';

export function createBeforeState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'block',
					condition: 'isHashTag',
				},
				{
					transitionTo: 'block',
					condition: 'isForwardSlash',
					actions: ['finalizeBlockStatement'],
				},
				{
					transitionTo: 'block',
					condition: 'isColon',
					actions: ['finalizeBlockStatement'],
				},
				{
					transitionTo: 'raw',
				},
			],
		},
	});
}

/**
 * @param {import('../../types').ParserContext} context
 */
export function createBeforeMonitor(context) {
	return {
		actions: {
			finalizeBlockStatement: h.action(() => {
				const blockStatement = context.stack.pop({
					expect: ['BlockStatement'],
				});
				const block = context.stack.peek({ expect: ['Block'] });
				block.append(blockStatement);
				block.end = context.index + 1;
			}),
		},
	};
}
