import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState({
			entry: [new EffectHandler({ run: ['action'] })],
		});
		state.resolve({
			actions: {
				action({ ownerState }) {
					expect(ownerState).toBe(state);
				},
			},
		});
	});
});
