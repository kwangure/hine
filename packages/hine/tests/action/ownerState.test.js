import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState({
			entry: [new EffectHandler2({ run: ['ownerState'] })],
		});
		state.monitor({
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
		const action = new Action({
			run({ ownerState: _ownerState }) {},
		});
		expect(() => action.ownerState).toThrow('Attempted to read ownerState');
	});
});
