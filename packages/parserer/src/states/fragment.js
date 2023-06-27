import { h } from 'hine';

export function createFragmentState() {
	return h.atomic({
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
