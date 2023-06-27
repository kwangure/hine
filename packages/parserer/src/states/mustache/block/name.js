import { h } from 'hine';

export function createNameState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'raw',
					condition: 'isWhiteSpace',
				},
				{
					transitionTo: 'done',
					condition: 'isMustacheClose',
				},
				{
					actions: ['addBlockStatementName'],
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
				actions: ['initializeBlock', 'initializeBlockStatement'],
			},
		],
	};
}
