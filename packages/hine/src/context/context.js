/**
 * @template {Record<string, any>} TContextOwnerState
 * @template {Record<string, any>} TContextAncestor
 */
export class Context {
	/** @type {Map<string, any>} */
	#data = new Map();
	__ownerState;
	/**
	 * @param {import('../state/base.js').BaseState<any, any>} owner
	 */
	constructor(owner) {
		this.__ownerState = owner;
	}
	/**
	 * @internal
	 *
	 * @template {import('./types.js').ContextKey<TContextAncestor, TContextOwnerState>} K
	 * @param {K} key
	 * @param {any} value
	 */
	__set(key, value) {
		this.#data.set(/** @type {string} */ (key), value);
	}
	/**
	 * @template {import('./types.js').ContextKey<TContextAncestor, TContextOwnerState>} K
	 * @param {K} key
	 * @returns {import('./types.js').ContextValue<K, TContextAncestor, TContextOwnerState>}
	 */
	get(key) {
		if (this.#data.has(key)) {
			return this.#data.get(key);
		}
		return /** @type {import('./types.js').ContextValue<K, TContextAncestor, TContextOwnerState>} */ (
			this.__ownerState?.parent?.context.get(key)
		);
	}
	/**
	 * @template {string} K
	 * @param {K extends keyof TContextOwnerState ? K : never} key
	 * @returns {boolean}
	 */
	has(key) {
		return this.#data.has(key);
	}
	/**
	 * @template {import('./types.js').ContextKey<{}, TContextOwnerState>} K
	 * @param {K} key
	 * @param {import('./types.js').ContextValue<K, {}, TContextOwnerState>} value
	 * @return {boolean}
	 */
	update(key, value) {
		if (this.#data.has(key)) {
			this.#data.set(key, value);
			return true;
		}
		return false;
	}
}
