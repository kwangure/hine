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
	 * @param {import('./types.js').ActionRunnerConfig<TStateConfig, TContextAncestor> & {
	 *     ownerState: import('../state/base.js').BaseState<TStateConfig, TContextAncestor>
	 * }} options
	 */
	constructor(options) {
		super(options.ownerState);
		this.#run = options.run;
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
