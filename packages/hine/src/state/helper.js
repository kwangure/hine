import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';

/**
 * @template {import('./types.js').AtomicStateConfig} TConfig
 * @param {TConfig} [config]
 */
export function atomic(config) {
	return /** @type {AtomicState<TConfig, {}>} */ (new AtomicState(config));
}

/**
 * @template {import('./types.js').CompoundStateConfig} TConfig
 * @param {TConfig} config
 */
export function compound(config) {
	return /** @type {CompoundState<TConfig, {}>} */ (new CompoundState(config));
}

/**
 * @template {import('./types.js').StateConfig} TConfig
 * @template {TConfig extends { children: Record<string, import('./types.js').StateNode> } ? CompoundState<TConfig, {}> : AtomicState<TConfig, {}>} U
 * @param {TConfig} [config]
 * @returns {U}
 */
export function state(config) {
	if (config?.children) {
		return /** @type {U} */ (new CompoundState(config));
	}

	return /** @type {U} */ (new AtomicState(config));
}
