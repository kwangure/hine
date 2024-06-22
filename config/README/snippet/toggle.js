import { atomic, compound, emitEvent, matches, resolveState } from 'hine';

const toggleConfig = compound('toggle', {
	initial: 'inactive',
	children: [
		atomic('inactive', {
			on: { toggle: 'active' },
		}),
		atomic('active', {
			on: { toggle: 'inactive' },
		}),
	],
});
const myToggle = resolveState(toggleConfig);

matches(myToggle, 'toggle.inactive'); // true

emitEvent(myToggle, 'toggle');

matches(myToggle, 'toggle.active'); // true
