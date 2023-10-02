import { EffectHandler } from '../handler/effect';
import { TransitionHandler } from '../handler/transition';

/**
 * Converts a string, or an array of strings and/or handler configs
 * into an array of handler configs.
 *
 * @param {string | import("../handler/types").HandlerConfig |(string|import("../handler/types").HandlerConfig)[]} input
 * @returns {import("../handler/types").HandlerConfig[]}
 */
export function normalizeHandlerConfig(input) {
	if (typeof input === 'string') {
		return [{ run: [input] }];
	}

	if (typeof input === 'object' && !Array.isArray(input)) {
		return [input];
	}

	let results = [];
	let tempRun = [];

	for (let item of input) {
		if (typeof item === 'string') {
			tempRun.push(item);
		} else if (typeof item === 'object') {
			if (tempRun.length > 0) {
				results.push({ run: tempRun });
				tempRun = [];
			}
			results.push(item);
		}
	}

	if (tempRun.length > 0) {
		results.push({ run: tempRun });
	}

	return results;
}

/**
 * @param {import("../handler/types").HandlerConfig & { name: string; ownerState: import('./base.js').BaseState<any, any>}} config
 * @returns {config is import("../handler/types").TransitionHandlerConfig & { name: string; ownerState: import('./base.js').BaseState<any, any>}}
 */
function isTransitionHandlerConfig(config) {
	return typeof config?.goto === 'string';
}

/**
 * @param {import("../handler/types").HandlerConfig & { name: string; ownerState: import('./base.js').BaseState<any, any>}} config
 */
export function createHandler(config) {
	if (isTransitionHandlerConfig(config)) {
		return new TransitionHandler(config);
	}

	return new EffectHandler(config);
}
