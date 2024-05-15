<!--
    This README is generated from ./config/README/TEMPLATE.md. Do not edit it directly.
-->

# Hine

A JavaScript state machine library.

### Install

```bash
npm install Hine
```

### Getting started

```javascript
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
myToggle.activeChildren.length === 1; // true

myToggle.activeChildren[0].name === 'inactive'; // true
emitEvent(myToggle, 'toggle');
myToggle.activeChildren[0].name === 'active'; // true
```
