import { state } from 'hine';

const checkboxState = state({
	name: 'checkbox',
	children: {
		unchecked: state(),
		checked: state(),
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
