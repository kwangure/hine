import { EffectHandler } from './effect.js';
import { TransitionHandler } from './transition.js';

/**
 * @template {import('./types.js').HandlerConfig} T
 * @template {T extends { goto: string } ? TransitionHandler : EffectHandler} U
 * @param {T} config
 * @returns {U}
 */
export function handler(config) {
	if (typeof config?.goto === 'string') {
		return /** @type {U} */ (
			new TransitionHandler(
				/** @type {import('./types.js').TransitionHandlerConfig} */ (config),
			)
		);
	}

	return /** @type {U} */ (new EffectHandler(config));
}
