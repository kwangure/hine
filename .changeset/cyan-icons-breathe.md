---
'hine': patch
---

Add `isActiveEvent` to check single events

```javascript
const state = new AtomicState({
	on: {
		EVENT: [
			{
				actions: ['action'],
			},
		],
	},
});
state.monitor({
	actions: {
		action: new Action({ run() {} }),
	},
});
state.start();

console.log(state.isActiveEvent('EVENT')); // true
```

This is faster than `state.activeEvents.includes("EVENT")` which walks the entire tree
first even when it doesn't need to.
