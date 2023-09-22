import { state } from 'hine';

const checkboxState = state({
	name: 'checkbox',
	children: {
		// child states will go here
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
