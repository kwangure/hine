import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('isActiveEvent', () => {
	it('returns boolean for active events', () => {
		const state = new AtomicState({
			on: {
				EVENT: {
					run: ['action'],
				},
			},
		});
		state.resolve({
			actions: {
				action() {},
			},
		});
		expect(state.isActiveEvent('EVENT')).toEqual(true);
		expect(state.isActiveEvent('RANDOM-EVENT')).toEqual(false);
	});
	it('throws when not initialized', () => {
		const state = new AtomicState({
			on: {
				EVENT: {
					run: ['action'],
				},
			},
		});
		expect(() => state.isActiveEvent('EVENT')).toThrow(
			"Attempted to call 'state.isActiveEvent()' before calling 'state.resolve()'",
		);
	});
	it('returns false when handler list is empty', () => {
		const state = new AtomicState({
			on: {
				EVENT: [],
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
