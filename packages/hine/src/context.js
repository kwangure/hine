/**
 * @template {Record<string, unknown>} [T=Record<string, unknown>]
 */
export class Context {
	/** @type {Map<keyof T, T[keyof T]>} */
	#data = new Map();
	/** @type {import('./state/base.js').BaseState | null} */
	__ownerState = null;
	/** @param {T} [data] */
	constructor(data) {
		if (data) {
			for (const [key, value] of Object.entries(data)) {
				this.#data.set(key, /** @type {T[keyof T]} */ (value));
			}
		}
	}
	/**
	 * @template K
	 * @param {K extends keyof T ? K : never} key
	 * @returns {K extends keyof T ? T[K] : never}
	 */
	get(key) {
		if (this.#data.has(/** @type {keyof T} */ (key))) {
			return /** @type {K extends keyof T ? T[K] : never} */ (
				this.#data.get(/** @type {keyof T} */ (key))
			);
		}
		return /** @type {K extends keyof T ? T[K] : never} */ (
			this.__ownerState?.parent?.context?.get(/** @type {any} */ (key))
		);
	}
	/**
	 * @template K
	 * @param {K extends keyof T ? K : never} key
	 * @returns {boolean}
	 */
	has(key) {
		return this.#data.has(key);
	}
	/**
	 * @template K
	 * @param {K extends keyof T ? K : never} key
	 * @param {K extends keyof T ? T[K] : never} value
	 */
	set(key, value) {
		this.#data.set(key, value);
	}
}
