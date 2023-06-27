import { h } from 'hine';

export function createNameState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'done',
					condition: 'isMustacheClose',
					actions: ['addBlockStatementEnd'],
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
				actions: ['initializeBlockStatement', 'addBlockStatementName'],
			},
		],
	};
}
