import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { Condition } from '../../src/condition.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: [
				{
					condition: 'condition',
					actions: ['action'],
				},
			],
		});
		state.monitor({
			actions: {
				action: new Action({
					run: () => {},
				}),
			},
			conditions: {
				condition: new Condition({
					run({ ownerState, event }) {
						expect(ownerState.event).toBe(event);
						return true;
					},
				}),
			},
		});
		state.start();
	});
	it('throws when accessed before initialisation', () => {
		const condition = new Condition({ name: 'condition', run: () => true });
		expect(() => condition.event).toThrow(
			"Attempted to read 'condition.event' at '?condition' before calling 'state.start()'",
		);
	});
});
