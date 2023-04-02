import { CompoundState } from './compound.js';

/**
 * Returns the active path of a state
 * @param {import('./types').StateNode | null} state
 * @returns {string}
 */
export function activePath(state) {
	if (state instanceof CompoundState) {
		return `${state.name}.${activePath(state.state)}`;
	}

	return state?.name || '';
}
