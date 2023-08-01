import { Action } from './action.js';
import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';
import { Condition } from './condition.js';
import { Context } from './context.js';
import { EffectHandler2 } from './handler/effect.js';
import { TransitionHandler } from './handler/transition.js';

/**
 * @typedef {import('./types').AtomicStateConfig} AtomicStateConfig
 * @typedef {import('./types').CompoundStateConfig} CompoundStateConfig
 * @typedef {import('./types').MonitorConfig} AtomicMonitorConfig
 * @typedef {import('./types').CompoundMonitorConfig} CompoundMonitorConfig
 * @typedef {import('./types').AtomicStateJSON} AtomicStateJSON
 * @typedef {import('./types').CompoundStateJSON} CompoundStateJSON
 * @typedef {import('./types').StateNode} StateNode
 * @typedef {import('./types').StateNodeJSON} StateNodeJSON
 */

/**
 * @param {import('./types').ActionConfig | import('./types').ActionConfig['run']} config
 */
export function action(config) {
	if (typeof config === 'function') {
		return new Action({ run: config });
	}

	return new Action(config);
}

/**
 * @param {AtomicStateConfig} [config]
 */
export function atomic(config) {
	return new AtomicState(config);
}

/**
 * @param {CompoundStateConfig} config
 */
export function compound(config) {
	return new CompoundState(config);
}

/**
 * @param {import('./types').ConditionConfig | import('./types').ConditionConfig['run']} config
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
 * @param {import("./types").EffectHandlerConfig} options
 */
export function effect(options) {
	return new EffectHandler2(options);
}

/**
 * @param {import("./types").TransitionHandlerConfig} options
 */
export function transition(options) {
	return new TransitionHandler(options);
}

export const h = {
	action,
	atomic,
	compound,
	condition,
	context,
	effect,
	transition,
};

export { Action, AtomicState, CompoundState, Condition, Context };
export { activePath } from './utils/state.js';
