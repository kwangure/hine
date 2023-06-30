import { h } from 'hine';

export function createStartState() {
	return h.atomic({
		on: {
			INIT: [
				{
					transitionTo: 'fragment',
				},
			],
		},
	});
}

/**
 * @param {import('../types').ParserContext} context
 */
export function createStartMonitor(context) {
	return {
		actions: {
			initialize: h.action({
				run() {
					context.index = 0;
					context.html.clear();
					context.stack.clear();
					context.stack.push(context.html);
				},
			}),
		},
		entry: [
			{
				actions: ['initialize'],
			},
		],
	};
}
