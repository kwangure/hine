import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('matches', () => {
	it('does not match when not started', () => {
		const machine = new CompoundState({
			name: 'machine',
			children: {
				s1: new AtomicState({}),
			},
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('matches state name when started', () => {
		const state = new CompoundState({
			name: 'machine',
			children: {
				s1: new AtomicState({}),
			},
		});
		state.resolve();
		expect(state.matches('machine')).toBe(true);
	});
	it('matches nested states', () => {
		const state = new CompoundState({
			name: 'machine',
			children: {
				s1: new CompoundState({
					children: {
						s11: new AtomicState({}),
					},
				}),
				s2: new CompoundState({
					children: {
						s21: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve();
		expect(state.matches('machine.s1')).toBe(true);
		expect(state.matches('machine.s1.s11')).toBe(true);
		expect(state.matches('machine.s2')).toBe(false);
		expect(state.matches('machine.s2.s21')).toBe(false);
	});
	it('matches anonymous states', () => {
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					children: {
						s11: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve();
		expect(state.matches('.s1')).toBe(true);
		expect(state.matches('.s1.s11')).toBe(true);
	});
});
