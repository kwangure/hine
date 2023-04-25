import { AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('dispatch', () => {
	it('throws on unresolved dispatch', () => {
		const machine = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		expect(() => machine.dispatch('test'))
			.toThrow('Attempted dispatch before resolving state');
	});

	it('transitions on dispatch', () => {
		const s1 = new CompoundState({
			on: {
				event: [{
					transitionTo: 's2',
				}],
			},
			states: {
				s11: new AtomicState(),
			},
		});
		const s2 = new CompoundState({
			on: {
				event: [{
					transitionTo: 's1',
				}],
			},
			states: {
				s21: new AtomicState(),
			},
		});
		const compound = new CompoundState({
			states: { s1, s2 },
		}).start();
		compound.dispatch('event');
		expect(compound.state).toBe(s2);
		compound.dispatch('event');
		expect(compound.state).toBe(s1);
		compound.dispatch('event');
		expect(compound.state).toBe(s2);
	});

	it('ignores invalid events', () => {
		const s1 = new AtomicState();
		const machine = new CompoundState({
			states: {
				s1,
				s2: new AtomicState(),
			},
		}).start();
		expect(() => {
			machine.dispatch('random');
		}).not.toThrow();
		expect(machine.state).toBe(s1);
	});
});
