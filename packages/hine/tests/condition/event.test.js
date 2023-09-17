import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					if: 'condition',
					run: ['action'],
				}),
			],
		});
		state.resolve({
			actions: {
				action() {},
			},
			conditions: {
				condition({ ownerState, event }) {
					expect(ownerState.event).toBe(event);
					return true;
				},
			},
		});
	});
});
