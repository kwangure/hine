---
'hine': patch
---

Make context non-nullable. Before you had to check that context was not null.
Now you don't. It always exists but may be empty.

```javascript
conditions: {
	condition: h.condition(({ ownerState }) => {
		ownerState?.context?.set('key', 'value');
					//     ^  ? no longer needed
	}),
},
```
