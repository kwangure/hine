import { h } from 'hine';

export function createNameState() {
	return h.atomic({
		on: {
			CHARACTER: [
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
				{
					transitionTo: 'equals',
					condition: 'isWhiteSpace',
				},
				{
					transitionTo: 'value',
					condition: 'isEquals',
				},
				{
					actions: ['addAttributeName'],
				},
			],
			RESET: [
				{
					actions: ['resetAttribute'],
				},
			],
		},
	});
}

export function createNameMonitor() {
	return {
		entry: [
			{
				actions: ['initializeAttribute', 'addAttributeName'],
			},
		],
	};
}
