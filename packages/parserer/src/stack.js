/** @typedef {import('./types').PTemplateNode} PTemplateNode */

export class PStack {
	/** @type {PTemplateNode[]} */
	#value = [];
	clear() {
		this.#value.length = 0;
	}
	/**
	 * @template {PTemplateNode['type']} T
	 * @param {{
	 *     depth?: number;
	 *     expect?: T[];
	 * } | undefined} [options]
	 */
	peek(options) {
		const { expect } = options || {};
		if (this.#value.length === 0) {
			throw Error('Attempted to peek an empty stack');
		}
		const value = /** @type {PTemplateNode} */ (this.#value.at(-1));
		if (expect) {
			const foundType = value.type;
			if (!expect.includes(/** @type {T} */ (foundType))) {
				const expectedTypesStr = expect.join("', '");
				throw Error(
					`Expected to pop a '${expectedTypesStr}' node, but found a '${foundType}' instead.`,
				);
			}
		}
		return /** @type {Extract<PTemplateNode, { type: T }>} */ (value);
	}
	/**
	 * @template {PTemplateNode['type']} T
	 * @param {{
	 *     depth?: number;
	 *     expect?: T[];
	 * } | undefined} [options]
	 */
	pop(options = {}) {
		const { expect } = options;
		if (this.#value.length === 0) {
			throw Error('Attempted to pop an empty stack');
		}
		const value = /** @type {PTemplateNode} */ (this.#value.at(-1));
		if (expect) {
			const foundType = value.type;
			if (!expect.includes(/** @type {T} */ (foundType))) {
				const expectedTypesStr = expect.join("', '");
				throw Error(
					`Expected to pop a '${expectedTypesStr}' node, but found a '${foundType}' instead.`,
				);
			}
		}
		return /** @type {Extract<PTemplateNode, { type: T }>} */ (
			this.#value.splice(this.#value.length - 1, 1)[0]
		);
	}
	/** @param {PTemplateNode} value */
	push(value) {
		return this.#value.push(value);
	}
	get size() {
		return this.#value.length;
	}
	toJSON() {
		return this.#value.map((node) => node.valueOf());
	}
}
