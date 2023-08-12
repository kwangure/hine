import { h } from 'hine';

const checkboxState = h.compound({
	name: 'checkbox',
	states: {
		unchecked: h.atomic({
			on: {
				toggle: [
					h.transition({
						goto: 'checked',
					}),
				],
			},
		}),
		checked: h.atomic({
			on: {
				toggle: [
					h.transition({
						goto: 'unchecked',
					}),
				],
			},
		}),
	},
});

console.log({ checkboxState }); // { checkboxState: CompoundState{} }
