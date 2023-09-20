import { BaseState } from './base.js';

/**
 * @template {import('./types.js').StateConfig} TStateConfig
 * @template {Record<string, import('../context/types.js').ContextTransformer>} TContextAncestor
 * @extends {BaseState<TStateConfig, TContextAncestor>}
 */
export class AtomicState extends BaseState {
	#type = /** @type {const} */ ('atomic');
	/**
	 * @param {import('./types.js').AtomicResolveConfig<TStateConfig, TContextAncestor>} [config]
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
