/**
 * @template {Record<string, any>} TContextOwnerState
 * @template {Record<string, any>} TContextAncestor
 */
export class Context {
	/** @type {Map<keyof TContextOwnerState, TContextOwnerState[keyof TContextOwnerState]>} */
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
	 * @template {string} K
	 * @param {import('./types.js').KeyOfMerged<K, TContextAncestor, TContextOwnerState>} key
	 * @param {any} value
	 */
	__set(key, value) {
		this.#data.set(/** @type {string} */ (key), value);
	}
	/**
	 * @template {string} K
	 * @param {import('./types.js').KeyOfMerged<K, TContextAncestor, TContextOwnerState>} key
	 * @returns {import('./types.js').ValueOfMerged<K, TContextAncestor, TContextOwnerState>}
	 */
	get(key) {
		if (this.#data.has(/** @type {keyof TContextOwnerState} */ (key))) {
			return /** @type {import('./types.js').ValueOfMerged<K, TContextAncestor, TContextOwnerState>} */ (
				this.#data.get(/** @type {keyof (TContextOwnerState)} */ (key))
			);
		}
		return /** @type {import('./types.js').ValueOfMerged<K, TContextAncestor, TContextOwnerState>} */ (
			this.__ownerState?.parent?.context.get(/** @type {any} */ (key))
		);
	}
	/**
	 * @template K
	 * @param {K extends keyof TContextOwnerState ? K : never} key
	 * @returns {boolean}
	 */
	has(key) {
		return this.#data.has(key);
	}
	/**
	 * @template {string} K
	 * @param {import('./types.js').KeyOfMerged<K, TContextAncestor, TContextOwnerState>} key
	 * @param {K extends keyof (TContextAncestor & TContextOwnerState) ? (TContextAncestor & TContextOwnerState)[K]: never} value
	 * @return {boolean}
	 */
	update(key, value) {
		if (this.#data.has(/** @type {string} */ (key))) {
			this.#data.set(/** @type {string} */ (key), value);
			return true;
		}
		return Boolean(
			this.__ownerState?.parent?.context.update(
				/** @type {string} */ (key),
				value,
			),
		);
	}
}
