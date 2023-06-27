import { h } from 'hine';

export function createNameState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'done',
					condition: 'isTagClose',
				},
				{
					actions: ['addElementName'],
				},
				// TODO: Otherwise invalid
			],
		},
	});
}

export function createNameMonitor() {
	return {
		entry: [
			{
				actions: ['initializeElement', 'addElementName'],
			},
		],
	};
}
