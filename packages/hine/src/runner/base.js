/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 */
export class BaseRunner {
	/** @type {import('../state/base.js').BaseState<TStateConfig, TContextAncestor>} */
	__ownerState;
	__name = '';
	/**
	 * @param {import('./types.js').BaseRunnerConfig & {
	 *     ownerState: import('../state/base.js').BaseState<TStateConfig, TContextAncestor>
	 * }} options
	 */
	constructor(options) {
		this.__name = options.name || '';
		this.__ownerState = options.ownerState;
	}
	get name() {
		return this.__name;
	}
}
