import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('ownerState', () => {
	it('returns parent state', () => {
		const state = new AtomicState({
			entry: [new EffectHandler({ run: ['ownerState'] })],
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
		const action = new Action({ run() {} });
		expect(() => action.ownerState).toThrow('Attempted to read ownerState');
	});
});
