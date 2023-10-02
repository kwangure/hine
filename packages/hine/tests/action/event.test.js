import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: { run: ['action'] },
		});
		state.resolve({
			actions: {
				action({ ownerState, event }) {
					expect(ownerState.event).toBe(event);
				},
			},
		});
	});
});
