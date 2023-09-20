import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';

/**
 * @template {import('./types.js').StateConfig} TConfig
 * @template {TConfig extends { children: Record<string, import('./types.js').StateNode> } ? CompoundState<TConfig, {}> : AtomicState<TConfig, {}>} U
 * @param {TConfig} [config]
 * @returns {U}
 */
export function state(config) {
	if (config?.children) {
		return /** @type {U} */ (
			/** @type {unknown} */ (
				new CompoundState(
					/** @type {import('./types.js').CompoundStateConfig} */ (config),
				)
			)
		);
	}

	return /** @type {U} */ (new AtomicState(config));
}
