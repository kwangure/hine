/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 */
export class BaseHandler {
	/** @type {string | null} */
	__ifConfig;
	__name = '';
	/** @type {string[]} */
	__runConfig;
	/**
	 * @param {import('./types').BaseHandlerConfig & { name: string; ownerState: import('../state/base.js').BaseState<TStateConfig, TContextAncestor>}} options
	 */
	constructor(options) {
		this.__ifConfig = options.if || null;
		this.__runConfig = options.run || [];
		this.__name = options.name;
		this.__ownerState = options.ownerState;
	}
	/** @type {import('../runner/base').BaseRunner<any, any>[]} */
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
	get context() {
		return this.__ownerState.context;
	}
	get event() {
		return this.__ownerState.event;
	}
	get name() {
		return this.__name;
	}
	get ownerState() {
		return this.__ownerState;
	}
	/** @type {string[]} */
	get path() {
		return this.__ownerState
			? [...this.__ownerState.path, `[${this.__name}]`]
			: [`[${this.__name}]`];
	}
}
