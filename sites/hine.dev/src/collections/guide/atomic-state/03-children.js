import { atomic, resolveState } from 'hine';

let count = 0;
const counterConfig = atomic('counter', {
	on: {
		increment: () => count++,
	},
});
const counterState = resolveState(counterConfig);

// Always `true` for atomic states
console.log(counterState.children.size === 0);
