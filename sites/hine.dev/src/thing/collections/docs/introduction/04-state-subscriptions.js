import { state } from 'hine';

const checkboxState = state({
	// omitted for brevity
});

checkboxState.subscribe((state) => {
	console.log(checkboxState === state); // true
});

checkboxState.resolve();
