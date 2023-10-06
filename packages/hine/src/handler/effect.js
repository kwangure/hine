import { BaseHandler } from './base.js';

/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {BaseHandler<TStateConfig, TContextAncestor>}
 */
export class EffectHandler extends BaseHandler {
	run() {
		const shouldExecute = !this.__condition || this.__condition(this);
		if (shouldExecute) {
			for (const action of this.__actions) {
				action(this);
			}
		}
		return shouldExecute;
	}
}
