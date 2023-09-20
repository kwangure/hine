/**
 * @template {Record<string, import('./types.js').ContextTransformer>} TContextOwnerState
 * @template {Record<string, import('./types.js').ContextTransformer>} TContextAncestor
 */
export class Context {
	/** @type {Map<keyof TContextOwnerState, TContextOwnerState[keyof TContextOwnerState]>} */
	#data = new Map();
	__ownerState;
	__transformers = /** @type {TContextOwnerState|undefined} */ (undefined);

	/**
	 * @param {import('../state/base.js').BaseState<any, any>} owner
	 * @param {TContextOwnerState} [transformers]
	 */
	constructor(owner, transformers) {
		this.__ownerState = owner;
		this.__transformers = transformers;
	}
	/**
	 * @template K
	 * @param {K extends keyof TContextOwnerState ? K : never} key
	 * @param {K extends keyof TContextOwnerState ? Parameters<TContextOwnerState[K]>[0]: never} value
	 */
	__set(key, value) {
		if (!this.__transformers) {
			this.#data.set(key, /** @type {any} */ (value));
		} else if (Object.hasOwn(this.__transformers, key)) {
			this.#data.set(key, this.__transformers[key](value));
		} else {
			let message = `Attempted to set key '${String(
				key,
			)}' for a non-existent context value.`;
			const keys = Object.keys(this.__transformers);
			if (keys.length) {
				message += ` Expected one of: ${keys}.`;
			}
			throw Error(message);
		}
	}
	/**
	 * @template K
	 * @param {K extends keyof (TContextAncestor & TContextOwnerState) ? K : keyof (TContextAncestor & TContextOwnerState)} key
	 * @returns {K extends keyof (TContextAncestor & TContextOwnerState) ? ReturnType<(TContextAncestor & TContextOwnerState)[K]> : never}
	 */
	get(key) {
		if (this.#data.has(/** @type {keyof TContextOwnerState} */ (key))) {
			return /** @type {K extends keyof (TContextAncestor & TContextOwnerState) ? ReturnType<(TContextAncestor & TContextOwnerState)[K]> : never} */ (
				this.#data.get(/** @type {keyof (TContextOwnerState)} */ (key))
			);
		}
		return /** @type {K extends keyof (TContextAncestor & TContextOwnerState) ? ReturnType<(TContextAncestor & TContextOwnerState)[K]> : never} */ (
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
	 * @template K
	 * @param {K extends keyof (TContextAncestor & TContextOwnerState) ? K : never} key
	 * @param {K extends keyof (TContextAncestor & TContextOwnerState) ? Parameters<(TContextAncestor & TContextOwnerState)[K]>[0]: never} value
	 */
	update(key, value) {
		if (this.#data.has(/** @type {keyof TContextOwnerState} */ (key))) {
			this.__set(
				/** @type {keyof TContextOwnerState} */ (key),
				/** @type {any} */ (value),
			);
			return true;
		}
		const updateSucessful = this.__ownerState?.parent?.context.update(
			key,
			value,
		);
		if (!updateSucessful) {
			throw Error(
				`Attempted to update key '${String(
					key,
				)}' for a non-existent context value.`,
			);
		}
		return true;
	}
}
