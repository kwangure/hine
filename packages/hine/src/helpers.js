import { Context } from './context.js';

/**
 * @template {Record<string, any>} T
 * @param {T} data
 */
export function context(data) {
	return /** @type {import('./types.js').Context<T> & { __type?: T; }} */ (
		/** @type {unknown} */ (new Context(data))
	);
}

export { action, condition } from './runner/helper.js';
export { handler } from './handler/helper.js';
export { state } from './state/helper.js';
