import { h } from 'hine';

const checkboxState = h.state({
	name: 'checkbox',
	children: {
		unchecked: h.state(),
		checked: h.state(),
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
