/**
 * @template {Record<string, import('./types.js').ContextTransformer>} [T=Record<string, import('./types.js').ContextTransformer>]
 */
export class Context {
	/** @type {Map<keyof T, T[keyof T]>} */
	#data = new Map();
	__ownerState;
	__transformers = /** @type {T|null} */ (null);

	/** @param {import('../state/base.js').BaseState<any>} owner */
	constructor(owner) {
		this.__ownerState = owner;
	}
	/**
	 * @template K
	 * @param {K extends keyof T ? K : keyof T} key
	 * @returns {K extends keyof T ? ReturnType<T[K]> : never}
	 */
	get(key) {
		if (this.#data.has(/** @type {keyof T} */ (key))) {
			return /** @type {K extends keyof T ? ReturnType<T[K]> : never} */ (
				this.#data.get(/** @type {keyof T} */ (key))
			);
		}
		return /** @type {K extends keyof T ? ReturnType<T[K]> : never} */ (
			this.__ownerState?.parent?.context.get(/** @type {any} */ (key))
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
	 * @param {K extends keyof T ? Parameters<T[K]>: never} value
	 */
	set(key, value) {
		if (!this.__transformers) {
			this.#data.set(key, /** @type {any} */ (value));
			return;
		}
		if (Object.hasOwn(this.__transformers, key)) {
			this.#data.set(key, this.__transformers[key](value));
		} else {
			throw Error(
				`Attempted to set key '${String(
					key,
				)}' for a non-existent context value. Expected one of: ${Object.keys(
					this.__transformers,
				)}.`,
			);
		}
	}
}
