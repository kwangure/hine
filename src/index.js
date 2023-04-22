import { Action } from './action.js';
import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';
import { Condition } from './condition.js';

/**
 * @typedef {import('./types').AtomicStateConfig} AtomicStateConfig
 * @typedef {import('./types').CompoundStateConfig} CompoundStateConfig
 * @typedef {import('./types').AtomicStateJSON} AtomicStateJSON
 * @typedef {import('./types').CompoundStateJSON} CompoundStateJSON
 * @typedef {import('./types').StateNode} StateNode
 * @typedef {import('./types').StateNodeJSON} StateNodeJSON
 */

/**
 * @param {ConstructorParameters<typeof Action>[0] | ((arg: any) => any)} config
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
 * @param {CompoundStateConfig} [config]
 */
export function compound(config) {
	return new CompoundState(config);
}

/**
 * @template {StateNode} T
 * @param {import('./types').ConditionConfig<T> | import('./types').ConditionConfig<T>['run']} config
 */
export function condition(config) {
	if (typeof config === 'function') {
		return new Condition({ run: config });
	}

	return new Condition(config);
}

export const h = {
	action,
	atomic,
	compound,
	condition,
};

export { Action, AtomicState, CompoundState, Condition };
export { activePath } from './utils/state.js';
