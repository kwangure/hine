import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';
import { ConditionRunner } from '../../src/runner/condition.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('matches', () => {
	it('does not match when not started', () => {
		const machine = new CompoundState({
			name: 'machine',
			children: {
				s1: new AtomicState(),
			},
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('matches state name when started', () => {
		const state = new CompoundState({
			name: 'machine',
			children: {
				s1: new AtomicState(),
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
						s11: new AtomicState(),
					},
				}),
				s2: new CompoundState({
					children: {
						s21: new AtomicState(),
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
						s11: new AtomicState(),
					},
				}),
			},
		});
		state.resolve();
		expect(state.matches('.s1')).toBe(true);
		expect(state.matches('.s1.s11')).toBe(true);
	});
	it('matches actions', () => {
		const state = new CompoundState({
			name: 'state',
			always: [
				new EffectHandler({
					run: ['action'],
				}),
			],
			children: {
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
		const state = new CompoundState({
			name: 'state',
			always: [
				new EffectHandler({
					if: 'condition',
					run: ['action'],
				}),
			],
			children: {
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
		const state = new CompoundState({
			name: 'state',
			always: [
				new EffectHandler({
					if: 'condition',
					run: ['action'],
				}),
			],
			children: {
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
		state.resolve({
			actions: {
				action: new ActionRunner({
					notifyBefore: true,
					run() {},
				}),
			},
			conditions: {
				condition: new ConditionRunner({
					notifyBefore: true,
					run: () => true,
				}),
			},
		});
	});
});
