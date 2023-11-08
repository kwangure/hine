import { compound } from 'hine';

const checkboxState = compound({
	on: {
		toggle: [
			/* ...omitted for brevity */
		],
	},
	children: {
		/* ...omitted for brevity */
	},
});

checkboxState.resolve();

console.log(checkboxState.matches('checkbox.unchecked')); // true

checkboxState.dispatch('toggle');

console.log(checkboxState.matches('checkbox.checked')); // true
