import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('isActiveEvent', () => {
	it('returns boolean for active events', () => {
		const state = new CompoundState({
			children: {
				s1: new AtomicState({
					on: {
						EVENT1: [
							new EffectHandler({
								run: ['action'],
							}),
						],
					},
				}),
				s2: new AtomicState({
					on: {
						EVENT2: [
							new EffectHandler({
								run: ['action'],
							}),
						],
					},
				}),
			},
		});
		state.resolve({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		expect(state.isActiveEvent('EVENT1')).toEqual(true);
		expect(state.isActiveEvent('EVENT2')).toEqual(false);
		expect(state.isActiveEvent('RANDOM-EVENT')).toEqual(false);
	});
	it('throws when not initialized', () => {
		const state = new CompoundState({
			on: {
				EVENT: [
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new AtomicState(),
			},
		});
		expect(() => state.isActiveEvent('EVENT')).toThrow(
			"Attempted to call 'state.isActiveEvent()' before calling 'state.resolve()'",
		);
	});
	it('returns false when handler list is empty', () => {
		const state = new CompoundState({
			on: {
				EVENT: [],
			},
			children: {
				s1: new AtomicState(),
			},
		});
		state.resolve({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		expect(state.isActiveEvent('EVENT')).toBe(false);
	});
});
