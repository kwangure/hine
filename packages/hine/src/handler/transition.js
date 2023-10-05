import { BaseHandler } from './base.js';

export class TransitionHandler extends BaseHandler {
	/** @type {string} */
	#goto;
	#type = /** @type {const} */ ('transition');

	/**
	 * @param {import('./types.js').TransitionHandlerConfig & { name: string; ownerState: import('../state/base.js').BaseState<any, any>}} options
	 *
	 */
	constructor(options) {
		super(options);
		this.#goto = options.goto;
	}
	run() {
		const from = this.__ownerState;
		from.__handler = this;
		const shouldExecute = !this.condition || this.condition.run();
		if (shouldExecute) {
			from.parent?.__transition(this.#goto, this.__actions);
		}
		from.__handler = null;
		return shouldExecute;
	}
	/**
	 * @returns {import('./types.js').TransitionHandlerJSON}
	 */
	toJSON() {
		return {
			type: this.#type,
			name: this.__name,
			goto: this.#goto,
			if: this.__condition?.name,
			run: this.__actions.map((action) => action.name),
			path: this.path,
		};
	}
	get transitionTo() {
		return this.#goto;
	}
	get type() {
		return this.#type;
	}
}
