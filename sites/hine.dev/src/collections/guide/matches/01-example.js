import { atomic, compound, emitEvent, matches, resolveState } from 'hine';

// Define a toggle state machine
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

// Create an instance of the state machine
const myToggle = resolveState(toggleConfig);

// Check initial state
console.log(matches(myToggle, 'toggle.inactive')); // true
console.log(matches(myToggle, 'toggle.active')); // false

// Emit an event to change state
emitEvent(myToggle, 'toggle');

// Check new state
console.log(matches(myToggle, 'toggle.inactive')); // false
console.log(matches(myToggle, 'toggle.active')); // true
