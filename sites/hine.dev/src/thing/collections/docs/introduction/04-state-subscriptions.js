import { h } from 'hine';

const checkboxState = h.state({
	// omitted for brevity
});

checkboxState.subscribe((state) => {
	console.log(checkboxState === state); // true
});

checkboxState.resolve();
