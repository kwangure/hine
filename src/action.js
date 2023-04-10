import { ACTION_NAME, ACTION_OWNER } from './constants.js';

/**
 * @typedef {import("./types").StateNode} StateNode
 */

function noop() {}

/**
 * @template {StateNode} [T=StateNode]
 */
export class Action {
	#name = '';
	/** @type {StateNode | null} */
	#ownerState = null;
	/** @type {(arg: any) => any} */
	#run = noop;

	/**
	 * @param {{
	 *     name?: string;
	 *     run: (this: T, arg: any) => any;
	 * }} options
	 */
	constructor(options) {
		this.#name = options.name || '';
		this.#run = options.run;
	}
	get name() {
		return this.#name;
	}
	/**
	 * @param {any} value
	 */
	run(value) {
		this.#run.call(this.#ownerState, value);
	}
	toJSON() {
		return {
			name: this.#name,
		};
	}
	/** @param {string} value */
	set [ACTION_NAME](value) {
		this.#name = value;
	}
	/** @param {import('./types').StateNode} owner */
	set [ACTION_OWNER](owner) {
		this.#ownerState = owner;
	}
}


