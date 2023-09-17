import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { ConditionRunner } from '../../src/runner/condition.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('event', () => {
	it('is an alias to ownerState.event', () => {
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					if: 'condition',
					run: ['action'],
				}),
			],
		});
		state.resolve({
			actions: {
				action: new ActionRunner({
					run: () => {},
				}),
			},
			conditions: {
				condition: new ConditionRunner({
					run({ ownerState, event }) {
						expect(ownerState.event).toBe(event);
						return true;
					},
				}),
			},
		});
	});
	it('throws when accessed before initialisation', () => {
		const condition = new ConditionRunner({
			name: 'condition',
			run: () => true,
		});
		expect(() => condition.event).toThrow(
			"Attempted to read 'condition.event' at '?condition' before calling 'state.resolve()'",
		);
	});
});
