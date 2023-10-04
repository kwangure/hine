import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('isActiveEvent', () => {
	it('returns boolean for active events', () => {
		const state = new CompoundState({
			children: {
				s1: new AtomicState({
					on: {
						EVENT1: {
							run: ['action'],
						},
					},
				}),
				s2: new AtomicState({
					on: {
						EVENT2: {
							run: ['action'],
						},
					},
				}),
			},
		});
		state.resolve({
			actions: {
				action() {},
			},
		});
		expect(state.isActiveEvent('EVENT1')).toEqual(true);
		expect(state.isActiveEvent('EVENT2')).toEqual(false);
		expect(state.isActiveEvent('RANDOM-EVENT')).toEqual(false);
	});
	it('returns false when handler list is empty', () => {
		const state = new CompoundState({
			on: {
				EVENT: [],
			},
			children: {
				s1: new AtomicState({}),
			},
		});
		state.resolve({
			actions: {
				action() {},
			},
		});
		expect(state.isActiveEvent('EVENT')).toBe(false);
	});
});
