import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('subscribe', () => {
	it('calls subscribers on start', () => {
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					children: {
						s11: new AtomicState({}),
					},
				}),
			},
		});
		let count = 0;
		state.subscribe(() => count++);
		expect(count).toBe(1);

		state.resolve();
		expect(count).toBe(2);
	});
	it('calls subscribers on disptach', () => {
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					on: {
						event: {
							run: ['noop'],
						},
					},
					children: {
						s11: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve({
			children: {
				s1: {
					actions: {
						noop() {},
					},
				},
			},
		});
		let count = 0;
		state.subscribe(() => count++);
		expect(count).toBe(1);

		state.dispatch('event');
		expect(count).toBe(2);

		// @ts-expect-error
		state.dispatch('useless');
		expect(count).toBe(3);
	});
});
