import { h } from 'hine';
import { PElement } from '../../nodes.js';

export function createOpenState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'end',
					condition: 'isForwardSlash',
				},
				{
					transitionTo: 'name',
					condition: 'isAlphaCharacter',
				},
				// TODO: Otherwise invalid
			],
		},
	});
}

/**
 * @param {import('../../types.js').ParserContext} context
 */
export function createOpenMonitor(context) {
	return {
		actions: {
			initialize: h.action({
				run() {
					const element = new PElement();
					element.end = context.index + 1;
					element.start = context.index;
					context.stack.push(element);
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
