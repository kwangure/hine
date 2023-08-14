import { h } from 'hine';

const checkboxState = h.state({
	name: 'checkbox',
	children: {
		unchecked: h.state({
			on: {
				toggle: [
					h.handler({
						goto: 'checked',
					}),
				],
			},
		}),
		checked: h.state({
			on: {
				toggle: [
					h.handler({
						goto: 'unchecked',
					}),
				],
			},
		}),
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
