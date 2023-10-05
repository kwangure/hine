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
	get type() {
		return this.#type;
	}
}
