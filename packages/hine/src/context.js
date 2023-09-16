export class Context {
	/** @type {Map<string, unknown>} */
	#data = new Map();
	/** @type {import('./state/base.js').BaseState | null} */
	__ownerState = null;
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
		return this.__ownerState?.parent?.context?.get(key);
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
		this.#data.set(key, value);
	}
}
