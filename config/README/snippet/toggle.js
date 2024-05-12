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
const myToggle = resolveState(toggleConfig);

// All compound states have exactly one active state
myToggle.activeStates.length === 1; // true

myToggle.activeStates[0][0] === 'inactive'; // true
emitEvent(myToggle, 'toggle');
myToggle.activeStates[0][0] === 'active'; // true
