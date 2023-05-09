import { CompoundState } from '../compound.js';

/**
 * Returns the active path of a state
 * @param {import('../types.js').StateNode} state
 * @returns {string}
 */
export function activePath(state) {
	if (state instanceof CompoundState) {
		if (state.state) {
			return state.state
				? `${state.name}.${activePath(state.state)}`
				: state.name;
		}
	}

	return state.name || '';
}
