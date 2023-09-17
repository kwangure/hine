import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('activeEvents', () => {
	it('returns handlable events', () => {
		const state = new CompoundState({
			on: {
				EVENT1: [
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new CompoundState({
					on: {
						EVENT2: [
							new EffectHandler({
								run: ['action'],
							}),
						],
					},
					children: {
						s11: new AtomicState(),
					},
				}),
			},
		});
		state.resolve({
			actions: {
				action: new ActionRunner({ run() {} }),
			},
		});
		expect(state.activeEvents).toEqual(['EVENT1', 'EVENT2']);
	});
	it('returns unique handlable events', () => {
		const state = new CompoundState({
			on: {
				EVENT: [
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new AtomicState({
					on: {
						EVENT: [
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
				action: new ActionRunner({ run() {} }),
			},
		});
		expect(state.activeEvents).toEqual(['EVENT']);
	});
	it('returns no events when not initialized', () => {
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
		expect(state.activeEvents).toEqual([]);
	});
	it('returns no events when handler list is empty', () => {
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
				action: new ActionRunner({ run() {} }),
			},
		});
		expect(state.activeEvents).toEqual([]);
	});
});
