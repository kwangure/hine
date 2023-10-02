import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: {
				if: 'condition',
				run: ['action'],
			},
		});
		state.resolve({
			actions: {
				action() {},
			},
			conditions: {
				condition({ ownerState, event }) {
					expect(ownerState.event).toBe(event);
					return true;
				},
			},
		});
	});
});
