import { atomic, parallel, resolveState } from 'hine';

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

const activeChildCount = playerState.activeStates.length;
const childCount = playerState.children.size;
// Always `true` for parallel states
console.log(activeChildCount === childCount);
