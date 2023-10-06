import { BaseRunner } from './base.js';

/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {BaseRunner<TStateConfig, TContextAncestor>}
 */
export class ConditionRunner extends BaseRunner {
	/** @type {(arg: any) => boolean} */
	#run;
	#type = /** @type {const} */ ('condition');

	/**
	 * @param {import('./types.js').ConditionRunnerConfig<TStateConfig, TContextAncestor>} condition
	 * @param {import('../state/base.js').BaseState<TStateConfig, TContextAncestor>} ownerState
	 */
	constructor(condition, ownerState) {
		super(ownerState);
		this.#run = condition;
	}
	run() {
		this.__ownerState.__condition = this;
		const result = this.#run.call(undefined, this);
		this.__ownerState.__condition = null;
		return result;
	}
	get type() {
		return this.#type;
	}
}
