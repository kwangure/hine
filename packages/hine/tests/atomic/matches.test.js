import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { ConditionRunner } from '../../src/runner/condition.js';
import { EffectHandler } from '../../src/handler/effect.js';

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
		state.resolve();
		expect(state.matches('machine')).toBe(true);
	});
	it('matches anonymous states', () => {
		const state = new AtomicState();
		state.resolve();
		expect(state.matches('')).toBe(true);
	});
	it('matches actions', () => {
		const state = new AtomicState({
			name: 'state',
			always: [
				new EffectHandler({
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
		state.resolve({
			actions: {
				action: new ActionRunner({
					notifyBefore: true,
					run() {},
				}),
			},
		});
	});
	it('matches conditions', () => {
		const state = new AtomicState({
			name: 'state',
			always: [
				new EffectHandler({
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
		state.resolve({
			actions: {
				action: new ActionRunner({ run() {} }),
			},
			conditions: {
				condition: new ConditionRunner({
					notifyBefore: true,
					run: () => true,
				}),
			},
		});
	});
	it('matches handler', () => {
		const state = new AtomicState({
			name: 'state',
			always: [
				new EffectHandler({
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
		state.resolve({
			actions: {
				action: new ActionRunner({
					notifyBefore: true,
					run() {},
				}),
			},
		});
	});
});
