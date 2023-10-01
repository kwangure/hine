import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';
import { EffectHandler } from '../../src/handler/effect.js';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					if: 'cond1',
					run: ['do'],
				}),
			],
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
	it('resolves condition using most specific configured name', () => {
		const state1 = new AtomicState({
			on: {
				event: [
					new EffectHandler({
						if: 'condition',
						run: ['action'],
					}),
				],
			},
		});
		expect(() =>
			state1.resolve({
				actions: {
					action() {},
				},
				conditions: {
					condition: {
						name: 'other-condition',
						run() {
							return true;
						},
					},
				},
			}),
		).toThrow(/unknown condition/);
		const state2 = new AtomicState({
			on: {
				event: [
					new EffectHandler({
						if: 'other-condition',
						run: ['action'],
					}),
				],
			},
		});
		expect(() =>
			state2.resolve({
				actions: {
					action() {},
				},
				conditions: {
					condition: {
						name: 'other-condition',
						run() {
							return true;
						},
					},
				},
			}),
		).not.toThrow();
	});
	it('ignores falsy handlers on entry', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					run: ['action'],
					if: 'isFalsy',
				}),
			],
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
			entry: [
				new EffectHandler({
					run: ['action'],
					if: 'isTruthy',
				}),
			],
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
					always: [
						new TransitionHandler({
							goto: 's2',
						}),
					],
					exit: [
						new EffectHandler({
							run: ['action'],
							if: 'isFalsy',
						}),
					],
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
					always: [
						new TransitionHandler({
							goto: 's2',
						}),
					],
					exit: [
						new EffectHandler({
							run: ['action'],
							if: 'isTruthy',
						}),
					],
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
						myEvent: [
							new EffectHandler({
								run: ['action'],
								if: 'isFalsy',
							}),
						],
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
						myEvent: [
							new EffectHandler({
								run: ['action'],
								if: 'isTruthy',
							}),
						],
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
			always: [
				new EffectHandler({
					run: ['action'],
					if: 'isFalsy',
				}),
			],
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
			always: [
				new EffectHandler({
					run: ['action'],
					if: 'isFalsy',
				}),
			],
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
