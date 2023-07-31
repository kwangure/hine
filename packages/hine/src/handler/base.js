export class BaseHandler {
	/** @type {string[]} */
	__actionConfig;
	/** @type {import('../action').Action[]} */
	__actions = [];
	/** @type {import('../condition').Condition | null} */
	__condition = null;
	/** @type {string | null} */
	__ifConfig;
	__name = '';
	/** @type {import('../base.js').BaseState | null} */
	__ownerState = null;
	/** @type {boolean | undefined} */
	__shouldNotifyBefore = undefined;
	/** @type {boolean | undefined} */
	__shouldNotifyAfter = undefined;
	/**
	 * @param {import('../types').EffectHandlerConfig} options
	 */
	constructor(options) {
		if (typeof options.notifyAfter === 'boolean') {
			this.__shouldNotifyAfter = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this.__shouldNotifyBefore = options.notifyBefore;
		}
		this.__actionConfig = options.run || [];
		this.__ifConfig = options.if || null;
	}
	__notifyAfter() {
		if (!this.__shouldNotifyAfter) return;
		this.__ownerState?.__callSubscribers();
	}
	__notifyBefore() {
		if (!this.__shouldNotifyBefore) return;
		this.__ownerState?.__callSubscribers();
	}
	/**
	 * @param {{
	 *   name: string;
	 *   ownerState: import("../base.js").BaseState;
	 * }} options
	 */
	__resolve(options) {
		this.__ownerState = options.ownerState;
		this.__name = options.name;
		this.__resolveActions();
		this.__resolveCondition();
	}
	__resolveActions() {
		for (const name of this.__actionConfig) {
			const action = this.__ownerState?.__allActions[name];
			if (!action) {
				let message = '';

				if (this.path.some((segment) => Boolean(segment))) {
					const path = this.path.join('.');
					message += `State '${path}' references unknown action '${name}'.`;
				} else {
					message += `State references unknown action '${name}'.`;
				}
				if (this.__ownerState?.__allActions) {
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
		const condition = this.__ownerState?.__allConditions[this.__ifConfig];
		if (!condition) {
			let message = '';
			if (this.path.some((segment) => Boolean(segment))) {
				const path = this.path.join('.');
				message += `State '${path}' references unknown condition '${this.__ifConfig}'.`;
			} else {
				message += `State references unknown condition '${this.__ifConfig}'. `;
			}
			if (this.__ownerState?.__allConditions) {
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
