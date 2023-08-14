import { h } from 'hine';

const toggle = h.state({
	// The first state is the default initial state
	children: {
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
