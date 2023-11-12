import { compound } from 'hine';

const checkboxState = compound({
	children: {
		/* ...omitted for brevity */
	},
});

checkboxState.subscribe((state) => {
	console.log(checkboxState === state); // true
});

checkboxState.resolve();
