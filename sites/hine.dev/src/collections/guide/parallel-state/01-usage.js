import { atomic, parallel, emitEvent, resolveState } from 'hine';

let health = 10;
let position = 10;
const playerConfig = parallel('player', {
	children: [
		atomic('health', {
			on: { advance: () => health++ },
		}),
		atomic('position', {
			on: { advance: () => position++ },
		}),
	],
});

const playerState = resolveState(playerConfig);

emitEvent(playerState, 'advance');
