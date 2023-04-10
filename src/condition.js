import { CONDITION_NAME, CONDITION_OWNER } from './constants.js';

function noop() {
	return true;
}

export class Condition {
	#name = '';
	/** @type {import('./types').StateNode | null} */
	#ownerState = null;
	/** @type {(arg: any) => boolean} */
	#run = noop;

	/**
	 * @param {{
	 *     name?: string;
	 *     run?: (arg: any) => boolean;
	 * }} [options]
	 */
	constructor(options) {
		this.#name = options?.name || '';
		this.#run = options?.run || noop;
	}
	/**
	 * @param {any} value
	 */
	run(value) {
		return this.#run.call(this.#ownerState, value);
	}
	toJSON() {
		return {
			name: this.#name,
		};
	}
	/** @param {string} value */
	set [CONDITION_NAME](value) {
		this.#name = value;
	}
	/** @param {import('./types').StateNode} owner */
	set [CONDITION_OWNER](owner) {
		this.#ownerState = owner;
	}
}
