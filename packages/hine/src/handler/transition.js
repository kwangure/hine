import { BaseHandler } from './base.js';

/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {BaseHandler<TStateConfig, TContextAncestor>}
 */
export class TransitionHandler extends BaseHandler {
	/** @type {string} */
	#goto;
	/**
	 * @param {import('./types.js').TransitionHandlerConfig & { name: string; ownerState: import('../state/base.js').BaseState<TStateConfig, TContextAncestor>}} options
	 *
	 */
	constructor(options) {
		super(options);
		this.#goto = options.goto;
	}
	run() {
		const shouldExecute = !this.__condition || this.__condition(this);
		if (shouldExecute) {
			this.__ownerState.parent?.__transition(
				this.#goto,
				/** @type {any} */ (this),
				this.__actions,
			);
		}
		return shouldExecute;
	}
	get transitionTo() {
		return this.#goto;
	}
}
