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
 * Returns a list of next possible state and the events that cause them
 *
 * @param {CompoundState} state
 */
export function nextStateNames(state) {
	/** @type {string[]} */
	const nextStates = [];
	const currentState = state.state;
	if (!currentState) return nextStates;

	const handlerValues = Object.values(currentState[ON_HANDLER]);
	for (let i = 0; i < handlerValues.length; i++) {
		const handlers = handlerValues[i];
		for (let j = 0; j < handlers.length; j++) {
			const handler = handlers[j];
			if (handler.transitionTo) {
				nextStates.push(handler.transitionTo.name);
			}
		}
	}

	return nextStates;
}
