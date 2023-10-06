import { BaseHandler } from './base.js';

export class EffectHandler extends BaseHandler {
	run() {
		const shouldExecute = !this.__condition || this.__condition();
		if (shouldExecute) {
			for (const action of this.__actions) {
				action();
			}
		}
		return shouldExecute;
	}
}
