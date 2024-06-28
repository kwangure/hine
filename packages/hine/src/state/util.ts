import type { BaseStateConfig, StateEventListener } from './types.js';

export function normalizeListeners(onConfig: BaseStateConfig['on']) {
	const listeners: Map<string, StateEventListener[]> = new Map();
	if (onConfig) {
		for (const [eventName, on] of Object.entries(onConfig)) {
			let listener;
			if (typeof on === 'function') {
				listener = [{ run: on }];
			} else if (typeof on === 'string') {
				listener = [{ goto: on }];
			} else if (Array.isArray(on)) {
				listener = on.map((on) => {
					if (typeof on === 'function') {
						return { run: on };
					} else if (typeof on === 'string') {
						return { goto: on };
					}
					return on;
				});
			} else {
				listener = [on];
			}
			listeners.set(eventName, listener);
		}
	}
	return listeners;
}
