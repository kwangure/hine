import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState({
			entry: {
				if: 'condition',
				run: ['action'],
			},
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
