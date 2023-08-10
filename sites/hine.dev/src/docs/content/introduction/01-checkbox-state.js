import { h } from 'hine';

const checkboxState = h.compound({
	name: 'checkbox',
	states: {
		// child states will go here
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
