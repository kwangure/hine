import { state } from 'hine';

const checkboxState = state({
	name: 'checkbox',
	children: {
		unchecked: state({
			on: {
				toggle: { goto: 'checked' },
			},
		}),
		checked: state({
			on: {
				toggle: { goto: 'unchecked' },
			},
		}),
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
