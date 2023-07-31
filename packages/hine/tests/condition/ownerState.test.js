import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';
import { Condition } from '../../src/condition.js';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState({
			entry: [new EffectHandler2({ run: ['ownerState'] })],
		});
		state.monitor({
			conditions: {
				condition: new Condition({
					run({ ownerState }) {
						expect(ownerState).toBe(state);
						return true;
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
