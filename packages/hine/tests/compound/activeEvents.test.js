import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
		expect(state.activeEvents).toEqual([]);
	});
});
