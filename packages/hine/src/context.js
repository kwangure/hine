/**
 * @typedef {import('./types').StateNode} StateNode
 */

import { CONTEXT_OWNER } from './constants.js';

export class Context {
	/** @type {Map<string, unknown>} */
	#data = new Map();
	/** @type {StateNode | null} */
	#ownerState = null;
	/** @param {Record<string, unknown>} [data] */
	constructor(data) {
		if (data) {
			for (const [key, value] of Object.entries(data)) {
				this.#data.set(key, value);
			}
		}
	}
	/**
	 * @param {string} key
	 * @returns {unknown}
	 */
	get(key) {
		if (this.#data.has(key)) {
			return this.#data.get(key);
		}
		return this.#ownerState?.parent?.context?.get(key);
	}
	/** @param {string} key */
	has(key) {
		return this.#data.has(key);
	}
	/**
	 * @param {string} key
	 * @param {any} value
	 */
	set(key, value) {
		return this.#data.set(key, value);
	}
	/** @param {StateNode} owner */
	set [CONTEXT_OWNER](owner) {
		this.#ownerState = owner;
	}
}
