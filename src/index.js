import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';

/**
 * @param {Partial<import('./atomic.js').AtomicStateConfig>} [config]
 */
export function atomic(config) {
	const atomic = new AtomicState();
	if (config) {
		atomic.configure(config);
	}
	return atomic;
}

/**
 * @param {Partial<import('./compound.js').CompoundStateConfig>} [config]
 */
export function compound(config) {
	const compound = new CompoundState();
	if (config) {
		compound.configure(config);
	}
	return compound;
}

export { AtomicState, CompoundState };
