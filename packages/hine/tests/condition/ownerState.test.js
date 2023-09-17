import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					if: 'condition',
					run: ['action'],
				}),
			],
		});
		state.resolve({
			conditions: {
				condition({ ownerState }) {
					expect(ownerState).toBe(state);
					return true;
				},
			},
			actions: {
				action({ ownerState }) {
					expect(ownerState).toBe(state);
				},
			},
		});
	});
});
