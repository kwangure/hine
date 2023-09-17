export class BaseRunner {
	/** @type {import('../state/base.js').BaseState} */
	__ownerState;
	__name = '';
	/** @type {boolean | undefined} */
	__notifyAfter = undefined;
	/** @type {boolean | undefined} */
	__notifyBefore = undefined;

	/**
	 * @param {import('./types.js').BaseRunnerConfig & {
	 *     ownerState: import('../state/base.js').BaseState
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
