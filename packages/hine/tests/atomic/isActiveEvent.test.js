import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('isActiveEvent', () => {
	it('returns boolean for active events', () => {
		const state = new AtomicState({
			on: {
				EVENT: [
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});
		state.resolve({
			actions: {
				action: new ActionRunner({ run() {} }),
			},
		});
		expect(state.isActiveEvent('EVENT')).toEqual(true);
		expect(state.isActiveEvent('RANDOM-EVENT')).toEqual(false);
	});
	it('throws when not initialized', () => {
		const state = new AtomicState({
			on: {
				EVENT: [
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});
		expect(() => state.isActiveEvent('EVENT')).toThrow(
			"Attempted to call 'state.isActiveEvent()' before calling 'state.resolve()'",
		);
	});
	it('returns false when handler list is empty', () => {
		const state = new AtomicState({
			on: {
				EVENT: [],
			},
		});
		state.resolve({
			actions: {
				action: new ActionRunner({ run() {} }),
			},
		});
		expect(state.isActiveEvent('EVENT')).toBe(false);
	});
});
