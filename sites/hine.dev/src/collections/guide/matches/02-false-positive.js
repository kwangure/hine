import { atomic, compound, matches, resolveState } from 'hine';

const stateConfig = compound('parent', {
	initial: 'child.with.dots',
	children: [atomic('child.with.dots'), atomic('other.child')],
});

const state = resolveState(stateConfig);

console.log(matches(state, 'parent.child.with.dots')); // true (correct)
console.log(matches(state, 'parent.child')); // true (false positive!)
