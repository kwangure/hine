import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		expect(() => state.isActiveEvent('EVENT')).toThrow(
			"Attempted to call 'state.isActiveEvent()' before calling 'state.start()'",
		);
	});
	it('returns false when handler list is empty', () => {
		const state = new AtomicState({
			on: {
				EVENT: [],
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
		expect(state.isActiveEvent('EVENT')).toBe(false);
	});
});
