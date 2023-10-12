import { atomic, compound } from 'hine';

const checkboxState = compound({
	name: 'checkbox',
	children: {
		unchecked: atomic({
			on: {
				toggle: { goto: 'checked' },
			},
		}),
		checked: atomic({
			on: {
				toggle: { goto: 'unchecked' },
			},
		}),
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
