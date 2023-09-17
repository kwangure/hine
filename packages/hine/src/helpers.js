import { Action } from './action.js';
import { Condition } from './condition.js';
import { Context } from './context.js';

/**
 * @param {import('./types.js').ActionConfig | import('./types.js').ActionConfig['run']} config
 */
export function action(config) {
	if (typeof config === 'function') {
		return new Action({ run: config });
	}

	return new Action(config);
}

/**
 * @param {import('./types.js').ConditionConfig | import('./types.js').ConditionConfig['run']} config
 */
export function condition(config) {
	if (typeof config === 'function') {
		return new Condition({ run: config });
	}

	return new Condition(config);
}

/**
 * @template {Record<string, any>} T
 * @param {T} data
 */
export function context(data) {
	return /** @type {import('./types.js').Context<T> & { __type?: T; }} */ (
		/** @type {unknown} */ (new Context(data))
	);
}

export { handler } from './handler/helper.js';
export { state } from './state/helper.js';
