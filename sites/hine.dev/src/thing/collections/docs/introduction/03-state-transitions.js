import { handler, state } from 'hine';

const checkboxState = state({
	name: 'checkbox',
	children: {
		unchecked: state({
			on: {
				toggle: [
					handler({
						goto: 'checked',
					}),
				],
			},
		}),
		checked: state({
			on: {
				toggle: [
					handler({
						goto: 'unchecked',
					}),
				],
			},
		}),
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
