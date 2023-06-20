import { Action, AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('subscribe', () => {
	it('calls subscribers on start', () => {
		const machine = new CompoundState({
			states: {
				s1: new CompoundState({
					states: {
						s11: new AtomicState(),
					},
				}),
			},
		});
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.start();
		expect(count).toBe(2);
	});
	it('calls subscribers on disptach', () => {
		const machine = new CompoundState({
			states: {
				s1: new CompoundState({
					actions: {
						noop: new Action({
							run() {},
						}),
					},
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
		}).start();
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.dispatch('event');
		expect(count).toBe(2);

		machine.dispatch('useless');
		expect(count).toBe(3);
	});
});
