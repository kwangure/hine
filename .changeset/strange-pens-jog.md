---
'hine': patch
---

Added context to states. This allows you to pass information to nested states
without drilling arguments through functions. You can access context state
from actions and conditions.

```javascript
const state = h.compound({
	context: h.context({ key: 'value' }),
	states: {
		state: h.atomic(({
			actions: {
				action: h.action(({ ownerState }) => {
					console.log(ownerState.context.get('key')); // "value"
				}),
			},
		}));,
	},
});
```
