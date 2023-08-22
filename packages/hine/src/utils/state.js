import { CompoundState } from '../state/compound.js';

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
