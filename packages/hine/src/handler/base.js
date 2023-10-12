export class BaseHandler {
	/** @type {string | null} */
	__ifConfig;
	/** @type {string[]} */
	__runConfig;
	/**
	 * @param {import('./types.js').BaseHandlerConfig & { ownerState: import('../state/base.js').BaseState<any, any>}} options
	 */
	constructor(options) {
		this.__ifConfig = options.if || null;
		this.__runConfig = options.run || [];
		this.__ownerState = options.ownerState;
	}
	get __actions() {
		const actions = [];
		for (const name of this.__runConfig) {
			const action = this.__ownerState.__getAction(name);
			if (!action) {
				let message = '';

				const path = this.__ownerState.path;
				if (path.some((segment) => Boolean(segment))) {
					message += `State '${path.join(
						'.',
					)}' references unknown action '${name}'.`;
				} else {
					message += `State references unknown action '${name}'.`;
				}

				const actions = Object.keys(this.__ownerState.__actions);
				if (actions.length) {
					message += ` Expected one of: ${actions.join(', ')}`;
				}

				throw Error(message);
			}
			actions.push(action);
		}
		return actions;
	}
	get __condition() {
		if (!this.__ifConfig) return null;
		const condition = this.__ownerState.__getCondition(this.__ifConfig);
		if (!condition) {
			let message = '';

			const path = this.__ownerState.path;
			if (path.some((segment) => Boolean(segment))) {
				message += `State '${path.join('.')}' references unknown condition '${
					this.__ifConfig
				}'.`;
			} else {
				message += `State references unknown condition '${this.__ifConfig}'. `;
			}

			const conditions = Object.keys(this.__ownerState.__conditions);
			if (conditions.length) {
				message += ` Expected one of: ${conditions.join(', ')}`;
			}

			throw Error(message);
		}

		return condition;
	}
}
