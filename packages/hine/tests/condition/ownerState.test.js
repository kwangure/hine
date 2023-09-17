import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { Condition } from '../../src/runner/condition.js';
import { EffectHandler } from '../../src/handler/effect.js';
import { Action } from '../../src/runner/action.js';

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
				condition: new Condition({
					run({ ownerState }) {
						expect(ownerState).toBe(state);
						return true;
					},
				}),
			},
			actions: {
				action: new Action({
					run({ ownerState }) {
						expect(ownerState).toBe(state);
					},
				}),
			},
		});
	});
	it('throws when accessed before initialisation', () => {
		const action = new Condition({
			run({ ownerState }) {
				return Boolean(ownerState);
			},
		});
		expect(() => action.ownerState).toThrow('Attempted to read ownerState');
	});
});
