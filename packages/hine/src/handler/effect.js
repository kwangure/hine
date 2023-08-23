import { BaseHandler } from './base.js';

export class EffectHandler extends BaseHandler {
	#type = /** @type {const} */ ('effect');
	run() {
		// This should never happen. Its mostly to help TypeScript out
		if (!this.__ownerState) throw Error('Missing handler ownerState');

		this.__ownerState.__handler = this;
		this.__notifyBefore();
		const shouldExecute = !this.condition || this.condition.run();
		if (shouldExecute) {
			for (const action of this.__actions) {
				action.run();
			}
		}
		this.__notifyAfter();
		this.__ownerState.__handler = null;
		return shouldExecute;
	}
	*step() {
		this.__notifyBefore();
		let shouldExecute = false;
		if (this.condition) {
			yield this.condition;
			shouldExecute = this.condition.run();
		}
		if (shouldExecute) {
			for (const action of this.__actions) {
				yield action;
				action.run();
			}
		}
		this.__notifyAfter();
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
