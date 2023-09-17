export class BaseRunner {
	/** @type {import('../state/base.js').BaseState | null} */
	__ownerState = null;
	__name = '';
	/** @type {boolean | undefined} */
	__notifyAfter = undefined;
	/** @type {boolean | undefined} */
	__notifyBefore = undefined;

	/**
	 * @param {import('./types.js').BaseRunnerConfig} options
	 */
	constructor(options) {
		this.__name = options.name || '';
		if (typeof options.notifyAfter === 'boolean') {
			this.__notifyAfter = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this.__notifyBefore = options.notifyBefore;
		}
	}
	get name() {
		return this.__name;
	}
}
