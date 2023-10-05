import { BaseHandler } from './base.js';

export class EffectHandler extends BaseHandler {
	#type = /** @type {const} */ ('effect');
	run() {
		this.__ownerState.__handler = this;
		const shouldExecute = !this.condition || this.condition.run();
		if (shouldExecute) {
			for (const action of this.__actions) {
				action.run();
			}
		}
		this.__ownerState.__handler = null;
		return shouldExecute;
	}
	/**
	 * @returns {import('./types.js').EffectHandlerJSON}
	 */
	toJSON() {
		return {
			type: this.#type,
			name: this.__name,
			if: this.__condition?.name,
			run: this.__actions.map((action) => action.name),
			path: this.path,
		};
	}
	get type() {
		return this.#type;
	}
}
