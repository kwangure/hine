import { h } from 'hine';

const checkboxState = h.compound({
	// omitted for brevity
});

checkboxState.subscribe((state) => {
	console.log(checkboxState === state); // true
});

checkboxState.start();
