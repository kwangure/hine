import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { Condition } from '../../src/condition.js';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('matches', () => {
	it('does not match when not started', () => {
		const machine = new AtomicState({
			name: 'machine',
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('matches state name when started', () => {
		const state = new AtomicState({
			name: 'machine',
		});
		state.start();
		expect(state.matches('machine')).toBe(true);
	});
	it('matches anonymous states', () => {
		const state = new AtomicState();
		state.start();
		expect(state.matches('')).toBe(true);
	});
	it('matches actions', () => {
		const state = new AtomicState({
			name: 'state',
			always: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
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
		state.monitor({
			actions: {
				action: new Action({
					notifyBefore: true,
					run() {},
				}),
			},
		});
		state.start();
	});
	it('matches conditions', () => {
		const state = new AtomicState({
			name: 'state',
			always: [
				new EffectHandler2({
					if: 'condition',
					run: ['action'],
				}),
			],
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
		state.monitor({
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
		state.start();
	});
	it('matches handler', () => {
		const state = new AtomicState({
			name: 'state',
			always: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
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
		state.monitor({
			actions: {
				action: new Action({
					notifyBefore: true,
					run() {},
				}),
			},
		});
		state.start();
	});
});
