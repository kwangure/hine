import { h } from 'hine';

export function createBeforeState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'name',
					condition: 'isAlphaCharacter',
				},
				// TODO: Otherwise invalid
			],
		},
	});
}
