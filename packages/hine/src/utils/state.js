import { CompoundState } from '../compound.js';

/**
 * Returns the active path of a state
 * @param {import('../types.js').StateNode} state
 * @returns {string}
 */
export function activePath(state) {
	if (state instanceof CompoundState && state.__state) {
		return `${state.name}.${activePath(state.__state)}`;
	}

	return state.name;
}

/**
 * @param {import("../types.js").StateNode} state
 * @param {string[]} [stateTreeEvents]
 */
export function stateEventNames(state, stateTreeEvents = []) {
	for (const name of Object.keys(state.__onHandler)) {
		if (!stateTreeEvents.includes(name)) {
			stateTreeEvents.push(name);
		}
	}

	if (state instanceof CompoundState && state.__state) {
		stateEventNames(state.__state, stateTreeEvents);
	}

	return stateTreeEvents;
}
