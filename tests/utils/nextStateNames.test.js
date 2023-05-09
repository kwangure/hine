import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
import { nextStateNames } from '../../src/utils/state.js';

describe('nextStateName', () => {
	it('returns next state names', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState({
					on: {
						event: [{
							transitionTo: 's2',
						}],
					},
				}),
				s2: new AtomicState({
					on: {
						event: [
							{
								transitionTo: 's3',
							},
							{
								transitionTo: 's1',
							},
						],
					},
				}),
				s3: new AtomicState(),
			},
		}).start();

		expect(nextStateNames(state)).toEqual(['s2']);
		state.dispatch('event');
		expect(nextStateNames(state)).toEqual(['s3', 's1']);
		state.dispatch('event');
		expect(nextStateNames(state)).toEqual([]);
	});
});
