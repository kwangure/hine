import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('dispatch', () => {
	it('throws on unresolved dispatch', () => {
		const state = new CompoundState({
			children: {
				s1: new AtomicState({}),
			},
		});
		// @ts-expect-error
		expect(() => state.dispatch('test')).toThrow(
			'Attempted dispatch before resolving state',
		);
	});

	it('transitions on dispatch', () => {
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					on: {
						event: {
							goto: 's2',
						},
					},
					children: {
						s11: new AtomicState({}),
					},
				}),
				s2: new CompoundState({
					on: {
						event: {
							goto: 's1',
						},
					},
					children: {
						s21: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve();
		state.dispatch('event');
		expect(state.matches('.s2')).toBe(true);
		state.dispatch('event');
		expect(state.matches('.s1')).toBe(true);
		state.dispatch('event');
		expect(state.matches('.s2')).toBe(true);
	});

	it('ignores invalid events', () => {
		const state = new CompoundState({
			children: {
				s1: new AtomicState({}),
				s2: new AtomicState({}),
			},
		});
		state.resolve();
		expect(() => {
			// @ts-expect-error
			state.dispatch('random');
		}).not.toThrow();
		expect(state.matches('.s1')).toBe(true);
	});
});
