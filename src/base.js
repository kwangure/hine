import { STATE_CALL_SUBSCRIBERS } from './constants.js';

export class BaseState {
	/** @type {Set<(arg: this) => any>} */
	#subscribers = new Set();
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.#subscribers.add(fn);
		return () => {
			this.#subscribers.delete(fn);
		};
	}
	[STATE_CALL_SUBSCRIBERS]() {
		for (const subscriber of this.#subscribers) {
			subscriber(this);
		}
	}
}
