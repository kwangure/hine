import { ActionRunner } from './runner/action.js';
import { ConditionRunner } from './runner/condition.js';
import { Context } from './context.js';

/**
 * @param {import('./runner/types.js').ActionRunnerConfig | import('./runner/types.js').ActionRunnerConfig['run']} config
 */
export function action(config) {
	if (typeof config === 'function') {
		return new ActionRunner({ run: config });
	}

	return new ActionRunner(config);
}

/**
 * @param {import('./runner/types.js').ConditionRunnerConfig | import('./runner/types.js').ConditionRunnerConfig['run']} config
 */
export function condition(config) {
	if (typeof config === 'function') {
		return new ConditionRunner({ run: config });
	}

	return new ConditionRunner(config);
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
