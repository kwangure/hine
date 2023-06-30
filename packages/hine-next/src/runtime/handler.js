export class Handler {
	/** @type {import('./action.js').Action[]} */
	__actions = [];
	/** @param {import('../types.js').HandlerConfig} config */
	constructor(config) {
		this.__actions = config.actions;
	}
	/**
	 * @param {any} value
	 */
	runActions(value) {
		for (const action of this.__actions) {
			action.run(value);
		}
	}
}
