import { Action, AtomicState, CompoundState, Condition } from '../../src';
import { describe, expect, it } from 'vitest';

describe('matches', () => {
	it('does not match when not started', () => {
		const machine = new CompoundState({
			name: 'machine',
			states: {
				s1: new AtomicState(),
			},
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('matches state name when started', () => {
		const machine = new CompoundState({
			name: 'machine',
			states: {
				s1: new AtomicState(),
			},
		}).start();
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
		}).start();
		expect(machine.matches('machine.s1')).toBe(true);
		expect(machine.matches('machine.s1.s11')).toBe(true);
		expect(machine.matches('machine.s2')).toBe(false);
		expect(machine.matches('machine.s2.s21')).toBe(false);
	});
	it('matches anonymous states', () => {
		const machine = new CompoundState({
			states: {
				s1: new CompoundState({
					states: {
						s11: new AtomicState(),
					},
				}),
			},
		}).start();
		expect(machine.matches('.s1')).toBe(true);
		expect(machine.matches('.s1.s11')).toBe(true);
	});
	it('matches actions', () => {
		const state = new CompoundState({
			name: 'state',
			always: [{
				actions: ['action'],
			}],
			actions: {
				action: new Action({
					notifyBefore: true,
					run() {},
				}),
			},
			states: {
				s1: new AtomicState(),
			},
		});
		let count = 1;
		state.subscribe(() => {
			// The value of Action is set only when the subscriber is called
			// during the `notifyBefore` phase/hook. i.e Call 2 to this function.
			if (count == 2) {
				expect(state.matches('state.(action)')).toBe(true);
			}
			count += 1;
		});
		state.start();
	});
	it('matches conditions', () => {
		const state = new CompoundState({
			name: 'state',
			always: [{
				condition: 'condition',
				actions: ['action'],
			}],
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({
					notifyBefore: true,
					run: () => true,
				}),
			},
			states: {
				s1: new AtomicState(),
			},
		});
		let count = 1;
		state.subscribe(() => {
			// The value of Condition is set only when the subscriber is called
			// during the `notifyBefore` phase/hook. i.e Call 2 to this function.
			if (count === 2) {
				expect(state.matches('state.?condition')).toBe(true);
			}
			count += 1;
		});
		state.start();
	});
	it('matches handler', () => {
		const state = new CompoundState({
			name: 'state',
			always: [{
				condition: 'condition',
				actions: ['action'],
			}],
			actions: {
				action: new Action({
					notifyBefore: true,
					run() {},
				}),
			},
			conditions: {
				condition: new Condition({
					notifyBefore: true,
					run: () => true,
				}),
			},
			states: {
				s1: new AtomicState(),
			},
		});
		let count = 1;
		state.subscribe(() => {
			// The value of Handler is set only when the subscriber is called
			// during the `notifyBefore` phase/hooks. i.e Call 2 & 3 to this function.
			if (count === 2) {
				expect(state.matches('state.?condition')).toBe(true);
				// Handler at index 0
				expect(state.matches('state.[0]')).toBe(true);
			} else if (count === 3) {
				expect(state.matches('state.(action)')).toBe(true);
				// Handler at index 0
				expect(state.matches('state.[0]')).toBe(true);
			}
			count += 1;
		});
		state.start();
	});
});
