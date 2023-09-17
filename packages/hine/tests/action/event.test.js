import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: [new EffectHandler({ run: ['action'] })],
		});
		state.resolve({
			actions: {
				action: new ActionRunner({
					run({ ownerState, event }) {
						expect(ownerState.event).toBe(event);
					},
				}),
			},
		});
	});
	it('throws when accessed before initialisation', () => {
		const action = new ActionRunner({ name: 'action', run() {} });
		expect(() => action.event).toThrow(
			"Attempted to read 'action.event' at '(action)' before calling 'state.resolve()'",
		);
	});
});
