import { h } from 'hine';

const checkboxState = h.state({
	// omitted for brevity
});

checkboxState.resolve();

console.log(checkboxState.matches('checkbox.unchecked'));
// true

checkboxState.dispatch('toggle');

console.log(checkboxState.matches('checkbox.checked'));
// true
