---
'hine': patch
---

Pass event values through `StateEvent{}` on states instead of drilling them
down through function call args

Before:

```javascript
const state = new AtomicState({
	on: {
		myEvent: [{ actions: ['action'] }],
	},
});
state.monitor({
	actions: {
		action: new Action({
			run({ ownerState, value }) {
				console.log(value); // 'myValue';
			},
		}),
	},
});
state.start();
state.dispatch('myEvent', 'myValue');
```

After:

```javascript
const state = new AtomicState({
	on: {
		myEvent: [{ actions: ['action'] }],
	},
});
state.monitor({
	actions: {
		action: new Action({
			run({ ownerState, event }) {
				console.log(ownerState.event === event); // true
				console.log(event.name); // 'myEvent';
				console.log(event.value); // 'myValue';
			},
		}),
	},
});
state.start();
state.dispatch('myEvent', 'myValue');
```
