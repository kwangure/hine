import { Action, AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('subscribe', () => {
	it('calls subscribers on start', () => {
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					children: {
						s11: new AtomicState(),
					},
				}),
			},
		});
		let count = 0;
		state.subscribe(() => count++);
		expect(count).toBe(1);

		state.start();
		expect(count).toBe(2);
	});
	it('calls subscribers on disptach', () => {
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					on: {
						event: [
							new EffectHandler2({
								run: ['noop'],
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
			states: {
				s1: {
					actions: {
						noop: new Action({
							run() {},
						}),
					},
				},
			},
		});
		state.start();
		let count = 0;
		state.subscribe(() => count++);
		expect(count).toBe(1);

		state.dispatch('event');
		expect(count).toBe(2);

		state.dispatch('useless');
		expect(count).toBe(3);
	});
});
