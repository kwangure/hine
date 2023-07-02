import { h } from 'hine';

/**
 * @param {import('../types').ParserContext} context
 */
export function createFragmentState(context) {
	return h.atomic({
		conditions: {
			isScriptOrStyle: h.condition(() => {
				const lastElement = context.stack.peek();
				return (
					lastElement.type === 'Element' &&
					(lastElement.name === 'script' || lastElement.name === 'style')
				);
			}),
		},
		on: {
			CHARACTER: [
				{
					transitionTo: 'tag',
					condition: 'isTagOpen',
				},
				{
					transitionTo: 'mustache',
					condition: 'isMustacheOpen',
				},
				{
					transitionTo: 'staticText',
					condition: 'isScriptOrStyle',
				},
				{
					transitionTo: 'text',
				},
			],
			EOF: [
				{
					transitionTo: 'eof',
				},
			],
			RESET: [
				{
					transitionTo: 'start',
				},
			],
		},
	});
}
