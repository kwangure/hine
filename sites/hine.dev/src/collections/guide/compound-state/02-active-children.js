import { atomic, compound, resolveState } from 'hine';

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

// Always `true` for compound states
console.log(toggleState.activeChildren.length === 1);
