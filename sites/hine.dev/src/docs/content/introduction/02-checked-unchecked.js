import { h } from 'hine';

const checkboxState = h.compound({
	name: 'checkbox',
	states: {
		unchecked: h.atomic(),
		checked: h.atomic(),
	},
});

console.log({ checkboxState });
// { checkboxState: CompoundState{} }
