import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: [{ actions: ['action'] }],
		});
		state.monitor({
			actions: {
				action: new Action({
					run({ ownerState, event }) {
						expect(ownerState.event).toBe(event);
					},
				}),
			},
		});
		state.start();
	});
});
