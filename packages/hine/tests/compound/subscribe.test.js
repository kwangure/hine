import { Action, AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('subscribe', () => {
	it('calls subscribers on start', () => {
		const state = new CompoundState({
			states: {
				s1: new CompoundState({
					states: {
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
			states: {
				s1: new CompoundState({
					on: {
						event: [
							{
								actions: ['noop'],
							},
						],
					},
					states: {
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
