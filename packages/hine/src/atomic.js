import { BaseState } from './base.js';
import { TO_JSON } from './constants.js';

export class AtomicState extends BaseState {
	#type = /** @type {const} */ ('atomic');
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		// @ts-expect-error
		this.__subscribers.add(/** @type {(arg: BaseState) => any} */ (fn));
		return () => {
			// @ts-expect-error
			this.__subscribers.delete(/** @type {(arg: BaseState) => any} */ (fn));
		};
	}
	toJSON() {
		const baseJSON = super[TO_JSON]();
		return {
			type: this.#type,
			...baseJSON,
		};
	}
	get type() {
		return this.#type;
	}
}
