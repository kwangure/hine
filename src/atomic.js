import { STATE_SUBSCRIBERS, TO_JSON } from './constants.js';
import { BaseState } from './base.js';

export class AtomicState extends BaseState {
	#type = /** @type {const} */('atomic');
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this[STATE_SUBSCRIBERS].add(/** @type {(arg: BaseState) => any} */(fn));
		return () => {
			this[STATE_SUBSCRIBERS].delete(/** @type {(arg: BaseState) => any} */(fn));
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
