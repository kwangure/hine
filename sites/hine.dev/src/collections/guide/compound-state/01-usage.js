import { atomic, compound, emitEvent, resolveState } from 'hine';

const toggleConfig = compound('toggle', {
	initial: 'inactive',
	children: [
		atomic('inactive', {
			on: { toggle: 'active' },
		}),
		atomic('active', {
			on: { toggle: 'inactive' },
		}),
	],
});

const toggleState = resolveState(toggleConfig);

emitEvent(toggleState, 'toggle');
