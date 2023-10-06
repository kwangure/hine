import { BaseHandler } from './base.js';

/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {BaseHandler<TStateConfig, TContextAncestor>}
 */
export class TransitionHandler extends BaseHandler {
	/** @type {string} */
	#goto;
	#type = /** @type {const} */ ('transition');

	/**
	 * @param {import('./types.js').TransitionHandlerConfig & { name: string; ownerState: import('../state/base.js').BaseState<TStateConfig, TContextAncestor>}} options
	 *
	 */
	constructor(options) {
		super(options);
		this.#goto = options.goto;
	}
	run() {
		const from = this.__ownerState;
		from.__handler = this;
		const shouldExecute = !this.__condition || this.__condition.run(this);
		if (shouldExecute) {
			// @ts-expect-error
			from.parent?.__transition(this.#goto, this, this.__actions);
		}
		from.__handler = null;
		return shouldExecute;
	}
	get transitionTo() {
		return this.#goto;
	}
	get type() {
		return this.#type;
	}
}
