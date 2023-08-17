import { h } from 'hine';

const checkboxState = h.state({
	name: 'checkbox',
	children: {
		// child states will go here
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
