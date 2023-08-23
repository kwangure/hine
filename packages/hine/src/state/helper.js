import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';

/**
 * @template {import('./types.js').StateConfig} T
 * @template {T extends { children: Record<string, import('./types.js').StateNode> } ? CompoundState : AtomicState} U
 * @param {T} [config]
 * @returns {U}
 */
export function state(config) {
	if (config?.children) {
		return /** @type {U} */ (
			new CompoundState(
				/** @type {import('./types.js').CompoundStateConfig} */ (config),
			)
		);
	}

	return /** @type {U} */ (new AtomicState(config));
}
