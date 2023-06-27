import { h } from 'hine';

export function createEqualsState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'before',
					condition: 'isWhiteSpace',
				},
				{
					transitionTo: 'value',
					condition: 'isEquals',
				},
				{
					transitionTo: 'name',
					condition: 'isAlphaCharacter',
					actions: ['finalizeAttribute'],
				},
				{
					transitionTo: 'done',
					condition: 'isForwardSlash',
					actions: ['finalizeAttribute'],
				},
				{
					transitionTo: 'done',
					condition: 'isTagClose',
					actions: ['finalizeAttribute'],
				},
				/**
				 * TODO: Error if:
				 * - Open quote with no closing quote e.g. `<tag value=">`
				 * - Self closing (forward slash) without attribute value e.g `<tag value=/>`
				 * - Tag end (greater than) without attribute value `<tag value=>`
				 */
			],
		},
	});
}
