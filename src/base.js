import { STATE_CALL_SUBSCRIBERS, STATE_NAME } from './constants.js';

/**
 * @typedef {{
 *     name: string;
 * }} BaseStateConfig
 */
export class BaseState {
	#name = '';
	/** @type {Set<(arg: this) => any>} */
	#subscribers = new Set();

	/**
	 * @param {Partial<BaseStateConfig>} [stateConfig]
	 */
	constructor(stateConfig) {
		if (!stateConfig) return;
		this.#name = stateConfig.name || '';
	}
	get name() {
		return this.#name;
	}
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
	/** @param {string} value */
	set [STATE_NAME](value) {
		this.#name = value;
	}
}
