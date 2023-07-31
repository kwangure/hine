import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { Condition } from '../../src/condition.js';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: [
				new EffectHandler2({
					if: 'condition',
					run: ['action'],
				}),
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
