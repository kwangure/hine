---
'hine-next': patch
---

Implemented atomic entry actions in the runtime.

```javascript
let event = 'noEvent';
const state = new AtomicState();
state.monitor({
	actions: {
		logEntry: new Action({
			run: () => (event = 'entryEvent'),
		}),
	},
	entry: [
		{
			actions: ['logEntry'],
		},
	],
});
state.start();
console.log(event); // "entryEvent"
```
