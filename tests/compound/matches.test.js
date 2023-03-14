import { AtomicState, CompoundState } from 'src';
import { describe, expect, it } from 'vitest';

describe('matches', () => {
	it('does not match when unresolved', () => {
		const machine = new CompoundState({
			name: 'machine',
			states: {
				s1: new AtomicState(),
			},
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('does not match when not started', () => {
		const machine = new CompoundState({
			name: 'machine',
			states: {
				s1: new AtomicState(),
			},
		}).resolve();
		expect(machine.matches('machine')).toBe(false);
	});
	it('matches state name when started', () => {
		const machine = new CompoundState({
			name: 'machine',
			states: {
				s1: new AtomicState(),
			},
		})
			.resolve()
			.start();
		expect(machine.matches('machine')).toBe(true);
	});
	it('matches nested states', () => {
		const machine = new CompoundState({
			name: 'machine',
			states: {
				s1: new CompoundState({
					states: {
						s11: new AtomicState(),
					},
				}),
				s2: new CompoundState({
					states: {
						s21: new AtomicState(),
					},
				}),
			},
		})
			.resolve()
			.start();
		expect(machine.matches('machine.s1')).toBe(true);
		expect(machine.matches('machine.s1.s11')).toBe(true);
		expect(machine.matches('machine.s2')).toBe(false);
		expect(machine.matches('machine.s2.s21')).toBe(false);
	});
});
