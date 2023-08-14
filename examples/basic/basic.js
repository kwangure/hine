import { h } from 'hine';

// Compound states can have child states
const toggle = h.state({
	// The first state is the default initial state
	children: {
		// Atomic states are leaf nodes. They do not have children
		inactive: h.state({
			on: {
				// Transitions change the current state after an event
				toggle: [h.handler({ goto: 'active' })],
			},
		}),
		active: h.state({
			on: {
				toggle: [h.handler({ goto: 'inactive' })],
			},
		}),
	},
});

toggle.start();

toggle.matches('inactive'); // true

toggle.dispatch('toggle');

toggle.matches('active'); // true
