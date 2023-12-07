import { BaseState } from './base.js';

/**
 * `atomic` creates an `AtomicState` instance.
 *
 * @template {string} TName - A string type representing the name of the state.
 * @template {import('./types.js').AtomicStateConfig<TName>} TConfig - The configuration type for the atomic state, defining its structure and behavior.
 * @param {TConfig} [config] - Optional configuration object for the atomic state.
 */
export function atomic(config) {
	return /** @type {AtomicState<import('../type-utils/is-any.js').IsAny<TConfig> extends true ? {} : TConfig, {}>} */ (
		new AtomicState(config ?? /** @type {TConfig} */ ({}))
	);
}

/**
 * `AtomicState` is the most basic state type in a state machine tree.
 * The class is used to represent simple, standalone states in the system that do
 * not contain any child states.
 * The class extends `BaseState`, inheriting its properties and methods,
 * to implement states that cannot be decomposed further into substates.
 *
 * @template {import('./types.js').StateConfig} TStateConfig Configuration defining the structure and behavior of atomic states.
 * @template {Record<string, any>} TContextAncestor A `Record` type representing the context data of ancestor nodes of the atomic state.
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
