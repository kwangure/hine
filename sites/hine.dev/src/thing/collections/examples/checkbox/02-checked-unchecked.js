import { atomic, compound } from 'hine';

const checkboxState = compound({
	name: 'checkbox',
	children: {
		unchecked: atomic(),
		checked: atomic(),
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
