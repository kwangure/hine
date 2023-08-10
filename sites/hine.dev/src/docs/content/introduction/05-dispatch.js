import { h } from 'hine';

const checkboxState = h.compound({
	// omitted for brevity
});

checkboxState.start();

console.log(checkboxState.matches('checkbox.unchecked'));
// true

checkboxState.dispatch('toggle');

console.log(checkboxState.matches('checkbox.checked'));
// true
