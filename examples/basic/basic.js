import { atomic, compound } from 'hine';

// Compound states have `children`
const toggle = compound({
	// The first state (in this case 'inactive') is the default initial state
	children: {
		// Atomic states do not have `children`. They're leaves in the tree.
		inactive: atomic({
			on: {
				// `goto` will change the current state after a 'toggle' event
				toggle: { goto: 'active' },
			},
		}),
		active: atomic({
			on: {
				toggle: { goto: 'inactive' },
			},
		}),
	},
});

toggle.resolve();

toggle.matches('inactive'); // true

toggle.dispatch('toggle');

toggle.matches('active'); // true
