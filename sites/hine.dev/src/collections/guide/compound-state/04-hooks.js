import { atomic, compound, emitEvent, resolveState } from 'hine';
import { logEvent } from './analytics.js';

const toggleConfig = compound('toggle', {
	initial: 'inactive',
	children: [
		atomic('inactive', {
			on: { toggle: 'active' },
		}),
		atomic('active', {
			hooks: {
				afterEntry: () => logEvent('active start'),
				beforeExit: () => logEvent('active end'),
			},
			on: { toggle: 'inactive' },
		}),
	],
});

const toggleState = resolveState(toggleConfig);

emitEvent(toggleState, 'toggle');
