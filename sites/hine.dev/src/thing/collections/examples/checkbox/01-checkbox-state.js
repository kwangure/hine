import { compound } from 'hine';

const checkboxState = compound({
	name: 'checkbox',
	children: {
		// child states will go here
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
