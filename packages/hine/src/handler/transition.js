import { BaseHandler } from './base.js';

export class TransitionHandler extends BaseHandler {
	/** @type {string} */
	#goto;
	/**
	 * @param {import('./types.js').TransitionHandlerConfig & { name: string; ownerState: import('../state/base.js').BaseState<any, any>}} options
	 *
	 */
	constructor(options) {
		super(options);
		this.#goto = options.goto;
	}
	run() {
		const shouldExecute = !this.__condition || this.__condition();
		if (shouldExecute) {
			this.__ownerState.parent?.__transition(this.#goto, this.__actions);
		}
		return shouldExecute;
	}
	get transitionTo() {
		return this.#goto;
	}
}
