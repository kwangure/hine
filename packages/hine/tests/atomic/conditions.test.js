import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const state = new AtomicState({
			entry: {
				if: 'cond1',
				run: ['do'],
			},
		});
		state.resolve({
			actions: {
				do() {},
			},
			conditions: {
				cond1({ ownerState }) {
					expect(() => ownerState?.conditions.cond2).not.toThrow();
					expect(ownerState?.conditions.cond2.run()).toBe(false);
					return true;
				},
				cond2: () => false,
			},
		});
	});
	it('ignores falsy handlers on entry', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new AtomicState({
			entry: {
				run: ['action'],
				if: 'isFalsy',
			},
		});
		state.resolve({
			actions: {
				action() {
					actions.push('action');
				},
			},
			conditions: {
				isFalsy() {
					return false;
				},
			},
		});
		expect(actions).toEqual([]);
	});
	it('runs truthy handlers on entry', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new AtomicState({
			entry: {
				run: ['action'],
				if: 'isTruthy',
			},
		});
		state.resolve({
			actions: {
				action() {
					actions.push('action');
				},
			},
			conditions: {
				isTruthy() {
					return true;
				},
			},
		});
		expect(actions).toEqual(['action']);
	});
	it('ignores falsy handlers on exit', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			children: {
				s1: new AtomicState({
					always: {
						goto: 's2',
					},
					exit: {
						run: ['action'],
						if: 'isFalsy',
					},
				}),
				s2: new AtomicState({}),
			},
		});
		state.resolve({
			children: {
				s1: {
					actions: {
						action() {
							actions.push('action');
						},
					},
					conditions: {
						isFalsy() {
							return false;
						},
					},
				},
			},
		});
		expect(actions).toEqual([]);
	});
	it('runs truthy handlers on exit', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			children: {
				s1: new AtomicState({
					always: {
						goto: 's2',
					},
					exit: {
						run: ['action'],
						if: 'isTruthy',
					},
				}),
				s2: new AtomicState({}),
			},
		});
		state.resolve({
			children: {
				s1: {
					actions: {
						action() {
							actions.push('action');
						},
					},
					conditions: {
						isTruthy() {
							return true;
						},
					},
				},
			},
		});
		expect(actions).toEqual(['action']);
	});
	it('ignores falsy handlers on dispatch', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					on: {
						myEvent: {
							run: ['action'],
							if: 'isFalsy',
						},
					},
					children: {
						s11: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve({
			children: {
				s1: {
					actions: {
						action() {
							actions.push('action');
						},
					},
					conditions: {
						isFalsy() {
							return false;
						},
					},
				},
			},
		});
		state.dispatch('myEvent');
		expect(actions).toEqual([]);
	});
	it('runs truthy handlers on dispatch', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					on: {
						myEvent: {
							run: ['action'],
							if: 'isTruthy',
						},
					},
					children: {
						s11: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve({
			children: {
				s1: {
					actions: {
						action() {
							actions.push('action');
						},
					},
					conditions: {
						isTruthy() {
							return true;
						},
					},
				},
			},
		});
		state.dispatch('myEvent');
		expect(actions).toEqual(['action']);
	});
	it('ignores falsy handlers on always', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new AtomicState({
			always: {
				run: ['action'],
				if: 'isFalsy',
			},
		});
		state.resolve({
			actions: {
				action() {
					actions.push('action');
				},
			},
			conditions: {
				isFalsy() {
					return false;
				},
			},
		});
		expect(actions).toEqual([]);
	});
	it('runs truthy handlers on always', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new AtomicState({
			always: {
				run: ['action'],
				if: 'isFalsy',
			},
		});
		state.resolve({
			actions: {
				action() {
					actions.push('action');
				},
			},
			conditions: {
				isFalsy() {
					return true;
				},
			},
		});
		expect(actions).toEqual(['action']);
	});
});
