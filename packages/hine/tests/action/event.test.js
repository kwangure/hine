import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: [new EffectHandler2({ run: ['action'] })],
		});
		state.monitor({
			actions: {
				action: new Action({
					run({ ownerState, event }) {
						expect(ownerState.event).toBe(event);
					},
				}),
			},
		});
		state.start();
	});
	it('throws when accessed before initialisation', () => {
		const action = new Action({ name: 'action', run() {} });
		expect(() => action.event).toThrow(
			"Attempted to read 'action.event' at '(action)' before calling 'state.start()'",
		);
	});
});
