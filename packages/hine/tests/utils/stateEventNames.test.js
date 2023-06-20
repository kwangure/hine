import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
import { stateEventNames } from '../../src/utils/state.js';

describe('stateEventNames', () => {
	it('returns events for current state', () => {
		const state = new CompoundState({
			on: {
				event: [],
			},
			states: {
				s1: new CompoundState({
					states: {
						s11: new AtomicState({
							on: {
								event111: [],
								event112: [],
							},
						}),
					},
					on: {
						event11: [
							{
								transitionTo: 's2',
							},
						],
						event12: [],
					},
				}),
				s2: new AtomicState({
					on: {
						event21: [],
						event22: [],
					},
				}),
			},
		}).start();

		expect(stateEventNames(state)).toEqual(['event', 'event11', 'event12', 'event111', 'event112']);
		state.dispatch('event11');
		expect(stateEventNames(state)).toEqual(['event', 'event21', 'event22']);
	});
});
