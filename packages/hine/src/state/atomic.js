import { BaseState } from './base.js';

// We use mapped types on `TConfig` to forbid additional properties
// on the config (e.g.children),
/**
 * @template {import('./types.js').AtomicStateConfig} TConfig
 * @param {{
 *   [K in keyof TConfig]: K extends keyof TConfig ? TConfig[K] : never;
 * }} [config]
 */
export function atomic(config) {
	return /** @type {AtomicState<TConfig, {}>} */ (
		new AtomicState(config ?? /** @type {TConfig} */ ({}))
	);
}

/**
 * @template {import('./types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {BaseState<TStateConfig, TContextAncestor>}
 */
export class AtomicState extends BaseState {
	#type = /** @type {const} */ ('atomic');
	/**
	 * @param {import('./types.js').RequireContext<TStateConfig, import('./types.js').AtomicResolveConfig<this>>} [config]
	 */
	resolve(config) {
		this.__resolve(config);
		this.__start();
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.__subscribers.add(
			/** @type {(arg: BaseState<TStateConfig, TContextAncestor>) => any} */ (
				fn
			),
		);
		return () => {
			this.__subscribers.delete(
				/** @type {(arg: BaseState<TStateConfig, TContextAncestor>) => any} */ (
					fn
				),
			);
		};
	}
	get type() {
		return this.#type;
	}
}
