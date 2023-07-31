import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('canTransitionTo', () => {
	it('returns booleans for transition', () => {
		const state = new CompoundState({
			name: 's0',
			states: {
				s1: new CompoundState({
					on: {
						EVENT: [
							new TransitionHandler({
								goto: 's2',
							}),
						],
					},
					states: {
						s11: new AtomicState(),
					},
				}),
				s2: new CompoundState({
					states: {
						s21: new AtomicState(),
					},
				}),
			},
		});
		state.start();
		expect(state.canTransitionTo('s0.s2')).toBe(true);
		expect(state.canTransitionTo('s0.s1')).toBe(false);
		expect(state.canTransitionTo('s0.random')).toBe(false);
	});
});
