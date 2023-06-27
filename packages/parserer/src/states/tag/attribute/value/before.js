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
					transitionTo: 'doubleQuoted',
					condition: 'isDoubleQuote',
				},
				{
					transitionTo: 'mustache',
					condition: 'isMustacheOpen',
				},
				{
					transitionTo: 'singleQuoted',
					condition: 'isSingleQuote',
				},
				{
					transitionTo: 'unquoted',
					condition: 'isAlphaCharacter',
				},
			],
		},
	});
}
