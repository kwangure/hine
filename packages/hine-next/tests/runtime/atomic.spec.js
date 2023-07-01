import { describe, expect, it } from 'vitest';
import { Action } from '../../src/runtime/action.js';
import { AtomicState } from '../../src/runtime/atomic.js';

describe('AtomicState', () => {
	it('emits entry events', () => {
		let event = 'noEvent';
		const state = new AtomicState();
		state.monitor({
			actions: {
				logEntry: new Action({
					run: () => (event = 'entryEvent'),
				}),
			},
			entry: [
				{
					actions: ['logEntry'],
				},
			],
		});
		state.start();
		expect(event).toBe('entryEvent');
	});
});
