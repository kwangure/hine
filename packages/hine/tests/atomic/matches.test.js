import { Action, AtomicState, Condition } from '../../src';
import { describe, expect, it } from 'vitest';

describe('matches', () => {
	it('does not match when not started', () => {
		const machine = new AtomicState({
			name: 'machine',
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('matches state name when started', () => {
		const machine = new AtomicState({
			name: 'machine',
		}).start();
		expect(machine.matches('machine')).toBe(true);
	});
	it('matches anonymous states', () => {
		const machine = new AtomicState().start();
		expect(machine.matches('')).toBe(true);
	});
	it('matches actions', () => {
		const state = new AtomicState({
			name: 'state',
			always: [
				{
					actions: ['action'],
				},
			],
			actions: {
				action: new Action({
					notifyBefore: true,
					run() {},
				}),
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
		const state = new AtomicState({
			name: 'state',
			always: [
				{
					condition: 'condition',
					actions: ['action'],
				},
			],
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({
					notifyBefore: true,
					run: () => true,
				}),
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
		const state = new AtomicState({
			name: 'state',
			always: [
				{
					actions: ['action'],
				},
			],
			actions: {
				action: new Action({
					notifyBefore: true,
					run() {},
				}),
			},
		});
		let count = 1;
		state.subscribe(() => {
			// The value of Handler is set only when the subscriber is called
			// during the `notifyBefore` phase/hook. i.e Call 2 to this function.
			if (count === 2) {
				expect(state.matches('state.(action)')).toBe(true);
				// Handler 0
				expect(state.matches('state.[0]')).toBe(true);
			}
			count += 1;
		});
		state.start();
	});
});
