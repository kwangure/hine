import { h } from 'hine';

// Compound states can have child states
const toggle = h.compound({
	// The first state is the default initial state
	states: {
		// Atomic states are leaf nodes. They do not have children
		inactive: h.atomic({
			on: {
				// Transitions change the current state after an event
				toggle: [h.transition({ goto: 'active' })],
			},
		}),
		active: h.atomic({
			on: {
				toggle: [h.transition({ goto: 'inactive' })],
			},
		}),
	},
});

toggle.start();

toggle.matches('inactive'); // true

toggle.dispatch('toggle');

toggle.matches('active'); // true
