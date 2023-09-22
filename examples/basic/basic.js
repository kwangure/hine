import { handler, state } from 'hine';

const toggle = state({
	// The first state is the default initial state
	children: {
		inactive: state({
			on: {
				// Transitions change the current state after an event
				toggle: [handler({ goto: 'active' })],
			},
		}),
		active: state({
			on: {
				toggle: [handler({ goto: 'inactive' })],
			},
		}),
	},
});

toggle.resolve();

toggle.matches('inactive'); // true

toggle.dispatch('toggle');

toggle.matches('active'); // true
