import { Context } from './context.js';

/**
 * @template {Record<string, any>} T
 * @param {T} data
 */
export function context(data) {
	return new Context(data);
}

export { handler } from './handler/helper.js';
export { state } from './state/helper.js';
