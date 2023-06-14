import { CompoundState } from '../compound.js';
import { ON_HANDLER } from '../constants.js';

/**
 * Returns the active path of a state
 * @param {import('../types.js').StateNode} state
 * @returns {string}
 */
export function activePath(state) {
	if (state instanceof CompoundState && state.state) {
		return `${state.name}.${activePath(state.state)}`;
	}

	return state.name;
}


/**
 * @param {import("../types.js").StateNode} state
 * @param {string[]} [stateTreeEvents]
 */
export function stateEventNames(state, stateTreeEvents = []) {
	for (const name of Object.keys(state[ON_HANDLER])) {
		if (!stateTreeEvents.includes(name)) {
			stateTreeEvents.push(name);
		}
	}

	if (state instanceof CompoundState && state.state) {
		stateEventNames(state.state, stateTreeEvents);
	}

	return stateTreeEvents;
}
