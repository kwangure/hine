<!--
    This README is generated from ./README_TEMPLATE.md. Do not edit it directly.
-->

# Hine

A JavaScript state machine library.

### Install

```bash
npm install hine
```

### Getting started

```javascript
import { atomic, compound } from 'hine';

// Compound states have `children`
const toggle = compound({
	// The first state (i.e. inactive) is the default initial state
	children: {
		// Atomic states do not have `children`. They're leaves in the tree.
		inactive: atomic({
			on: {
				// Transitions change the current state after an event
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
```
