# Hine

A JavaScript state machine library.

### Install
```bash
npm install hine
```

### Getting started
```javascript
import { h } from 'hine';

// Compound states can have child states.
const toggle = h.compound({
	// The first state is the default initial state.
	states: {
		// Atomic states are leaf nodes. They do not have children.
		inactive: h.atomic({
			on: { toggle: 'active' },
		}),
		active: h.atomic({
			on: { toggle: 'inactive' },
		}),
	},
});

toggle.subscribe((alsoToggle) => {
	// toggle === alsoToggle
	console.log({ state: toggle.state.name });
	// { state: null };
})

toggle.start();
// { state: 'inactive' };

toggle.dispatch('toggle');
// { state: 'active' };
```