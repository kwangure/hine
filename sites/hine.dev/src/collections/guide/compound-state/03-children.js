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

const activeChildCount = toggleState.activeStates.length;
const childCount = toggleState.children.size;
// Always `true` for compound states
console.log(activeChildCount === 1);
console.log(childCount >= activeChildCount);
