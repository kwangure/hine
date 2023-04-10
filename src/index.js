import { Action } from './action.js';
import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';

/**
 * @param {ConstructorParameters<typeof Action>[0] | ((arg: any) => any)} config
 */
export function action(config) {
	if (typeof config === 'function') {
		return new Action({ run: config });
	}

	return new Action(config);
}


/**
 * @param {Partial<import('./atomic.js').AtomicStateConfig>} [config]
 */
export function atomic(config) {
	return new AtomicState(config);
}

/**
 * @param {Partial<import('./compound.js').CompoundStateConfig> & {
 *     states: Record<string, import('./types.js').StateNode>
 * }} [config]
 */
export function compound(config) {
	return new CompoundState(config);
}

export { Action, AtomicState, CompoundState };
export { activePath } from './utils.js';
