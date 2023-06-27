import { h } from 'hine';

export function createEOFState() {
	return h.atomic({
		on: {
			RESET: [
				{
					transitionTo: 'start',
				},
			],
		},
	});
}
