import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('canTransitionTo', () => {
	it('returns booleans for transition', () => {
		const state = new CompoundState({
			name: 's0',
			children: {
				s1: new AtomicState({
					on: {
						EVENT: [
							new TransitionHandler({
								goto: 's2',
							}),
						],
					},
				}),
				s2: new AtomicState({}),
			},
		});
		state.resolve();
		expect(state.canTransitionTo('s0.s2')).toBe(true);
		expect(state.canTransitionTo('s0.s1')).toBe(false);
		expect(state.canTransitionTo('s0.random')).toBe(false);
	});
});
