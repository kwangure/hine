import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('canTransitionTo', () => {
	it('returns booleans for transition', () => {
		const state = new CompoundState({
			name: 's0',
			children: {
				s1: new CompoundState({
					on: {
						EVENT: {
							goto: 's2',
						},
					},
					children: {
						s11: new AtomicState({}),
					},
				}),
				s2: new CompoundState({
					children: {
						s21: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve();
		expect(state.canTransitionTo('s0.s2')).toBe(true);
		expect(state.canTransitionTo('s0.s1')).toBe(false);
		expect(state.canTransitionTo('s0.random')).toBe(false);
	});
});
