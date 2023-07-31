import { AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('dispatch', () => {
	it('throws on unresolved dispatch', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		expect(() => state.dispatch('test')).toThrow(
			'Attempted dispatch before resolving state',
		);
	});

	it('transitions on dispatch', () => {
		const state = new CompoundState({
			states: {
				s1: new CompoundState({
					on: {
						event: [
							new TransitionHandler({
								goto: 's2',
							}),
						],
					},
					states: {
						s11: new AtomicState(),
					},
				}),
				s2: new CompoundState({
					on: {
						event: [
							new TransitionHandler({
								goto: 's1',
							}),
						],
					},
					states: {
						s21: new AtomicState(),
					},
				}),
			},
		});
		state.monitor({});
		state.start();
		state.dispatch('event');
		expect(state.matches('.s2')).toBe(true);
		state.dispatch('event');
		expect(state.matches('.s1')).toBe(true);
		state.dispatch('event');
		expect(state.matches('.s2')).toBe(true);
	});

	it('ignores invalid events', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
				s2: new AtomicState(),
			},
		});
		state.start();
		expect(() => {
			state.dispatch('random');
		}).not.toThrow();
		expect(state.matches('.s1')).toBe(true);
	});
});
