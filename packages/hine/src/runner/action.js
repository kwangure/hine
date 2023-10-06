import { BaseRunner } from './base.js';

/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {BaseRunner<TStateConfig, TContextAncestor>}
 */
export class ActionRunner extends BaseRunner {
	/** @type {(arg: any) => any} */
	#run;
	#type = /** @type {const} */ ('action');
	/**
	 * @param {import('./types.js').ActionRunnerConfig<TStateConfig, TContextAncestor>} action
	 * @param {import('../state/base.js').BaseState<TStateConfig, TContextAncestor>} ownerState
	 */
	constructor(action, ownerState) {
		super(ownerState);
		this.#run = action;
	}
	run() {
		this.__ownerState.__action = this;
		const result = this.#run.call(undefined, this);
		this.__ownerState.__action = null;
		return result;
	}
	get type() {
		return this.#type;
	}
}
