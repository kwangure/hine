import { state } from 'hine';

// details omitted for brevity
const checkboxState = state({
	on: {
		toggle: [],
	},
});

checkboxState.resolve();

console.log(checkboxState.matches('checkbox.unchecked'));
// true

checkboxState.dispatch('toggle');

console.log(checkboxState.matches('checkbox.checked'));
// true
