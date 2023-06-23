import { AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('dispatch', () => {
	it('throws on unresolved dispatch', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		expect(() => state.dispatch('test'))
			.toThrow('Attempted dispatch before resolving state');
	});

	it('transitions on dispatch', () => {
		const s1 = new CompoundState({
			on: {
				event: [
					{
						transitionTo: 's2',
					},
				],
			},
			states: {
				s11: new AtomicState(),
			},
		});
		const s2 = new CompoundState({
			on: {
				event: [
					{
						transitionTo: 's1',
					},
				],
			},
			states: {
				s21: new AtomicState(),
			},
		});
		const state = new CompoundState({
			states: { s1, s2 },
		});
		state.monitor({});
		state.start();
		state.dispatch('event');
		expect(state.state).toBe(s2);
		state.dispatch('event');
		expect(state.state).toBe(s1);
		state.dispatch('event');
		expect(state.state).toBe(s2);
	});

	it('ignores invalid events', () => {
		const s1 = new AtomicState();
		const state = new CompoundState({
			states: {
				s1,
				s2: new AtomicState(),
			},
		}).start();
		expect(() => {
			state.dispatch('random');
		}).not.toThrow();
		expect(state.state).toBe(s1);
	});
});
