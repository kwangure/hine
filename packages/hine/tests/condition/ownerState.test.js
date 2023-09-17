import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { ConditionRunner } from '../../src/runner/condition.js';
import { EffectHandler } from '../../src/handler/effect.js';
import { ActionRunner } from '../../src/runner/action.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					if: 'condition',
					run: ['action'],
				}),
			],
		});
		state.resolve({
			conditions: {
				condition: new ConditionRunner({
					run({ ownerState }) {
						expect(ownerState).toBe(state);
						return true;
					},
				}),
			},
			actions: {
				action: new ActionRunner({
					run({ ownerState }) {
						expect(ownerState).toBe(state);
					},
				}),
			},
		});
	});
	it('throws when accessed before initialisation', () => {
		const action = new ConditionRunner({
			run({ ownerState }) {
				return Boolean(ownerState);
			},
		});
		expect(() => action.ownerState).toThrow('Attempted to read ownerState');
	});
});
