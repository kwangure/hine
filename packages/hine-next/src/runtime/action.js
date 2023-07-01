export class Action {
	/**
	 * @param {import('../types').ActionConfig} config
	 */
	constructor(config) {
		this.__run = config.run;
	}
	/** @param {any} value */
	run(value) {
		return this.__run.call(undefined, value);
	}
}
