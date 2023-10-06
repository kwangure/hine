import { BaseHandler } from './base.js';

/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {BaseHandler<TStateConfig, TContextAncestor>}
 */
export class EffectHandler extends BaseHandler {
	#type = /** @type {const} */ ('effect');
	run() {
		this.__ownerState.__handler = this;
		const shouldExecute = !this.__condition || this.__condition.run(this);
		if (shouldExecute) {
			for (const action of this.__actions) {
				// @ts-expect-error
				action.run(this);
			}
		}
		this.__ownerState.__handler = null;
		return shouldExecute;
	}
	get type() {
		return this.#type;
	}
}
