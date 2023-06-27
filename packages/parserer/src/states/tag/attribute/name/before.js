import { h } from 'hine';

export function createBeforeState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'before',
					condition: 'isWhiteSpace',
				},
				{
					transitionTo: 'done',
					condition: 'isForwardSlash',
				},
				{
					transitionTo: 'name',
					condition: 'isAlphaCharacter',
				},
				{
					transitionTo: 'shorthand',
					condition: 'isMustacheOpen',
				},
			],
		},
	});
}
