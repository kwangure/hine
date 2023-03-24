import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';

/**
 * @param {Partial<import('./atomic.js').AtomicStateConfig>} [config]
 */
export function atomic(config) {
	return new AtomicState(config);
}

/**
 * @param {Partial<import('./compound.js').CompoundStateConfig>} [config]
 */
export function compound(config) {
	return new CompoundState(config);
}

export { AtomicState, CompoundState };
