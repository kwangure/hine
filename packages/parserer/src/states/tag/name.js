import { h } from 'hine';

export function createNameState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'attribute',
					condition: 'isWhiteSpace',
				},
				{
					transitionTo: 'done',
					condition: 'isTagClose',
				},
				{
					transitionTo: 'selfClose',
					condition: 'isForwardSlash',
				},
				{
					actions: ['addElementName'],
				},
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
