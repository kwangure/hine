import { Action } from './action.js';
import { AtomicState } from './state/atomic.js';
import { CompoundState } from './state/compound.js';
import { Condition } from './condition.js';
import { Context } from './context.js';
import { EffectHandler } from './handler/effect.js';
import { TransitionHandler } from './handler/transition.js';

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

/** @param {Record<string, any>} data */
export function context(data) {
	return new Context(data);
}

/**
 * @param {import('./types.js').HandlerConfig} options
 */
export function handler(options) {
	if (options.goto) {
		return new TransitionHandler(
			/** @type {import('./types.js').TransitionHandlerConfig} */ (options),
		);
	}
	return new EffectHandler(options);
}

/**
 * @param {import("./types.js").StateConfig} [options]
 */
export function state(options) {
	if (options?.children) {
		return new CompoundState(
			/** @type {import('./types.js').CompoundStateConfig} */ (options),
		);
	}
	return new AtomicState(options);
}
