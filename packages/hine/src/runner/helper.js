import { ActionRunner } from './action.js';
import { ConditionRunner } from './condition.js';

/**
 * @param {import('./types.js').ActionRunnerConfig | import('./types.js').ActionRunnerConfig['run']} config
 */
export function action(config) {
	if (typeof config === 'function') {
		return new ActionRunner({ run: config });
	}

	return new ActionRunner(config);
}

/**
 * @param {import('./types.js').ConditionRunnerConfig | import('./types.js').ConditionRunnerConfig['run']} config
 */
export function condition(config) {
	if (typeof config === 'function') {
		return new ConditionRunner({ run: config });
	}

	return new ConditionRunner(config);
}
