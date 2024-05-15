import { atomic, emitEvent, resolveState } from 'hine';

let count = 0;
const counterConfig = atomic('counter', {
	on: {
		increment: () => (count += 1),
	},
});
const counterState = resolveState(counterConfig);

emitEvent(counterState, 'increment');
