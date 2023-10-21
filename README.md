<!--
    This README is generated from ./README_TEMPLATE.md. Do not edit it directly.
-->

<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./packages/assets/wordmark-dark.svg" alt="Hine" width="300" height="150"></source>
  <source media="(prefers-color-scheme: light)" srcset="./packages/assets/wordmark-dark.svg" alt="Hine" width="300" height="150"></source>
  <img src="./wordmark.svg" alt="Hine" width="300" height="150">
</picture>
</div>

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
