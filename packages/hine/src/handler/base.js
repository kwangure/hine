export class BaseHandler {
	/** @type {import('../runner/action').ActionRunner<any, any>[]} */
	__actions = [];
	/** @type {import('../runner/condition').ConditionRunner<any, any> | null} */
	__condition = null;
	/** @type {string | null} */
	__ifConfig;
	__name = '';
	/** @type {string[]} */
	__runConfig;
	/**
	 * @param {import('./types').BaseHandlerConfig & { name: string; ownerState: import('../state/base.js').BaseState<any, any>}} options
	 */
	constructor(options) {
		this.__ifConfig = options.if || null;
		this.__runConfig = options.run || [];
		this.__name = options.name;
		this.__ownerState = options.ownerState;
		this.__resolveActions();
		this.__resolveCondition();
	}
	__resolveActions() {
		for (const name of this.__runConfig) {
			const action = this.__ownerState.__allActions[name];
			if (!action) {
				let message = '';

				if (this.path.some((segment) => Boolean(segment))) {
					const path = this.path.join('.');
					message += `State '${path}' references unknown action '${name}'.`;
				} else {
					message += `State references unknown action '${name}'.`;
				}
				if (this.__ownerState.__allActions) {
					const actions = Object.keys(this.__ownerState.__allActions);
					if (actions.length) {
						message += ` Expected one of: ${actions.join(', ')}`;
					}
				}

				throw Error(message);
			}
			this.__actions.push(action);
		}
	}
	__resolveCondition() {
		if (!this.__ifConfig) return;
		const condition = this.__ownerState.__allConditions[this.__ifConfig];
		if (!condition) {
			let message = '';
			if (this.path.some((segment) => Boolean(segment))) {
				const path = this.path.join('.');
				message += `State '${path}' references unknown condition '${this.__ifConfig}'.`;
			} else {
				message += `State references unknown condition '${this.__ifConfig}'. `;
			}
			if (this.__ownerState.__allConditions) {
				const conditions = Object.keys(this.__ownerState.__allConditions);
				if (conditions.length) {
					message += ` Expected one of: ${conditions.join(', ')}`;
				}
			}
			throw Error(message);
		}

		this.__condition = condition;
	}
	get condition() {
		return this.__condition;
	}
	get name() {
		return this.__name;
	}
	/** @type {string[]} */
	get path() {
		return this.__ownerState
			? [...this.__ownerState.path, `[${this.__name}]`]
			: [`[${this.__name}]`];
	}
}
