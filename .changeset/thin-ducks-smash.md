---
'hine': patch
---

Add a `canTransitioTo` to check possible transitions

```javascript
const state = new CompoundState({
	name: 's0',
	states: {
		s1: new AtomicState({
			on: {
				EVENT: [
					{
						transitionTo: 's2',
					},
				],
			},
		}),
		s2: new AtomicState(),
	},
});
state.start();

console.log(state.canTransitionTo('s0.s2')); // true
```
