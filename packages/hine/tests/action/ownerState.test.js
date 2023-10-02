import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState({
			entry: { run: ['action'] },
		});
		state.resolve({
			actions: {
				action({ ownerState }) {
					expect(ownerState).toBe(state);
				},
			},
		});
	});
});
