/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, import('../context/types.js').ContextTransformer>} TContextAncestor
 */
export class BaseRunner {
	/** @type {import('../state/base.js').BaseState<TStateConfig, TContextAncestor>} */
	__ownerState;
	__name = '';
	/** @type {boolean | undefined} */
	__notifyAfter = undefined;
	/** @type {boolean | undefined} */
	__notifyBefore = undefined;

	/**
	 * @param {import('./types.js').BaseRunnerConfig & {
	 *     ownerState: import('../state/base.js').BaseState<TStateConfig, TContextAncestor>
	 * }} options
	 */
	constructor(options) {
		this.__name = options.name || '';
		if (typeof options.notifyAfter === 'boolean') {
			this.__notifyAfter = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this.__notifyBefore = options.notifyBefore;
		}
		this.__ownerState = options.ownerState;
	}
	get name() {
		return this.__name;
	}
}
