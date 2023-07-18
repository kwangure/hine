---
'hine': patch
---

Expose list of active handled events via `state.activeEvents`

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
console.log(state.activeEvents); // ["EVENT"];
```
