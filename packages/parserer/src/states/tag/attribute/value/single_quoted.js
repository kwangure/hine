import { h } from 'hine';

export function createSingleQuotedState() {
	return h.atomic({
		on: {
			CHARACTER: [
				{
					transitionTo: 'done',
					condition: 'isSingleQuote',
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

export function createSingleQuotedMonitor() {
	return {
		entry: [
			{
				actions: ['initializeTextValue'],
			},
		],
	};
}
