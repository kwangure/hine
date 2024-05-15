import { atomic, emitEvent, resolveState } from 'hine';

/** @type {number} */
let count;
const initializeCount = () => (count = 0);
const counterConfig = atomic('counter', {
	hooks: {
		afterEntry: initializeCount,
	},
	on: {
		increment: () => (count += 1),
	},
});

const counterState = resolveState(counterConfig);

emitEvent(counterState, 'increment');
