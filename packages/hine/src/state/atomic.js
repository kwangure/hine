import { BaseState } from './base.js';

/**
 * @template {import('./types.js').StateConfig} TStateConfig
 * @extends {BaseState<TStateConfig>}
 */
export class AtomicState extends BaseState {
	#type = /** @type {const} */ ('atomic');
	/**
	 * @param {import('./types.js').AtomicResolveConfig<TStateConfig>} [config]
	 */
	resolve(config) {
		this.__resolve(config);
		this.__start();
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.__subscribers.add(
			/** @type {(arg: BaseState<TStateConfig>) => any} */ (fn),
		);
		return () => {
			this.__subscribers.delete(
				/** @type {(arg: BaseState<TStateConfig>) => any} */ (fn),
			);
		};
	}
	toJSON() {
		return {
			type: this.#type,
			...super.__toJSON(),
		};
	}
	get type() {
		return this.#type;
	}
}
