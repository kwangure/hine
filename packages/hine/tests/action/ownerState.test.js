import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState();
		state.monitor({
			actions: {
				action: new Action({
					run({ ownerState }) {
						expect(ownerState).toBe(state);
					},
				}),
			},
			entry: [{ actions: ['ownerState'] }],
		});
	});
	it('throws when accessed before initialisation', () => {
		const action = new Action({
			run({ ownerState: _ownerState }) {},
		});
		expect(() => action.ownerState).toThrow('Attempted to read ownerState');
	});
});
