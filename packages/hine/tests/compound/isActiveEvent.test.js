import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('isActiveEvent', () => {
	it('returns boolean for active events', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState({
					on: {
						EVENT1: [
							new EffectHandler2({
								run: ['action'],
							}),
						],
					},
				}),
				s2: new AtomicState({
					on: {
						EVENT2: [
							new EffectHandler2({
								run: ['action'],
							}),
						],
					},
				}),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
		expect(state.isActiveEvent('EVENT1')).toEqual(true);
		expect(state.isActiveEvent('EVENT2')).toEqual(false);
		expect(state.isActiveEvent('RANDOM-EVENT')).toEqual(false);
	});
	it('throws when not initialized', () => {
		const state = new CompoundState({
			on: {
				EVENT: [
					new EffectHandler2({
						run: ['action'],
					}),
				],
			},
			states: {
				s1: new AtomicState(),
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
		const state = new CompoundState({
			on: {
				EVENT: [],
			},
			states: {
				s1: new AtomicState(),
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
