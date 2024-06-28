import type { Run, StateEventListener } from './types.js';

export function normalizeListener(
	on:
		| string
		| Run
		| StateEventListener
		| (string | Run | StateEventListener)[],
) {
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
	return listener;
}

type ListenerRecord = Record<
	string,
	string | Run | StateEventListener | (string | Run | StateEventListener)[]
>;

export function createListenerMap(listenerRecord?: ListenerRecord) {
	const listeners: Map<string, StateEventListener[]> = new Map();
	if (listenerRecord) {
		for (const [eventName, on] of Object.entries(listenerRecord)) {
			listeners.set(eventName, normalizeListener(on));
		}
	}
	return listeners;
}
