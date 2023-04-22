import { BaseState } from './base.js';
import { STATE_SUBSCRIBERS } from './constants.js';

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
	/**
	 * @returns {import('./types').AtomicStateJSON}
	 */
	toJSON() {
		return {
			name: this.name,
			type: this.#type,
		};
	}
	get type() {
		return this.#type;
	}
}
