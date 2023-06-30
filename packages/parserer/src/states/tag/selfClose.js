import { h } from 'hine';

export function createSelfCloseState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'done',
					condition: 'isTagClose',
					actions: ['finalizeElement'],
				},
			],
		},
	});
}

/**
 * @param {import('../../types').ParserContext} context
 */
export function createSelfCloseMonitor(context) {
	return {
		actions: {
			finalizeElement: h.action(() => {
				const element = context.stack.pop({ expect: ['Element'] });
				element.end = context.index + 1;
				const elementParent = context.stack.peek({
					expect: ['BlockStatement', 'Fragment', 'Element'],
				});
				elementParent.append(element);
				elementParent.end = context.index + 1;
			}),
		},
	};
}
