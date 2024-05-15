import { atomic, parallel, emitEvent, resolveState } from 'hine';

/** @type {number} */
let health;
/** @type {number} */
let position;
const initializeHealth = () => (health = 10);
const initializePosition = () => (position = 10);
const playerConfig = parallel('player', {
	children: [
		atomic('health', {
			hooks: {
				afterEntry: initializeHealth,
			},
			on: { advance: () => health++ },
		}),
		atomic('position', {
			hooks: {
				afterEntry: initializePosition,
			},
			on: { advance: () => position++ },
		}),
	],
});

const playerState = resolveState(playerConfig);

emitEvent(playerState, 'advance');
