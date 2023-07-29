import { BaseState } from './base.js';

export class AtomicState extends BaseState {
	#type = /** @type {const} */ ('atomic');
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.__subscribers.add(/** @type {(arg: BaseState) => any} */ (fn));
		return () => {
			this.__subscribers.delete(/** @type {(arg: BaseState) => any} */ (fn));
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
