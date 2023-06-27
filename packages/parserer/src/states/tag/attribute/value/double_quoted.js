import { h } from 'hine';

export function createDoubleQuotedState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'done',
					condition: 'isDoubleQuote',
					actions: ['finalizeQuotedValue', 'finalizeAttribute'],
				},
				{
					actions: ['addChar'],
				},
			],
			RESET: [
				{
					actions: ['resetText'],
				},
			],
		},
	});
}

export function createDoubleQuotedMonitor() {
	return {
		entry: [
			{
				actions: ['initializeTextValue'],
			},
		],
	};
}
