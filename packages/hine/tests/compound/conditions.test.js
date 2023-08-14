import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
import { Condition } from '../../src/condition.js';
import { EffectHandler } from '../../src/handler/effect.js';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const cond2 = new Condition({
			run: () => false,
		});
		const state = new CompoundState({
			entry: [
				new EffectHandler({
					if: 'cond1',
					run: ['do'],
				}),
			],
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				do: new Action({
					run() {},
				}),
			},
			conditions: {
				cond1: new Condition({
					run({ ownerState }) {
						expect(() => ownerState?.conditions.cond2).not.toThrow();
						expect(ownerState?.conditions.cond2).toBe(cond2);
						expect(ownerState?.conditions.cond2.run()).toBe(false);
						return true;
					},
				}),
				cond2,
			},
		});
		state.start();
	});
	it('calls condition with self-reference', () => {
		const condition = new Condition({
			run(value) {
				expect(this).toBe(undefined);
				expect(value).toBe(condition);
				return true;
			},
		});
		const state = new CompoundState({
			entry: [
				new EffectHandler({
					if: 'condition',
					run: ['action'],
				}),
			],
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {},
				}),
			},
			conditions: {
				condition,
			},
		});
		state.start();
	});
	it('calls subscribers before condition', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			on: {
				event: [
					new EffectHandler({
						if: 'condition',
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({
					notifyBefore: true,
					run() {
						log.push('condition');
						return true;
					},
				}),
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'sub', // notifyBefore
			'condition',
			'sub',
		]);
	});
	it('calls subscribers after condition', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			on: {
				event: [
					new EffectHandler({
						if: 'condition',
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({
					notifyAfter: true,
					run() {
						log.push('condition');
						return true;
					},
				}),
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'condition',
			'sub', // notifyAfter
			'sub',
		]);
	});
	it('passes condition config from parent state', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			on: {
				event: [
					new EffectHandler({
						if: 'condition',
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({
					run() {
						log.push('condition');
						return true;
					},
				}),
			},
			conditionConfig: {
				notifyBefore: true,
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'sub', // notifyBefore
			'condition',
			'sub',
		]);
	});
	it('passes condition config from grandparent state', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					on: {
						event: [
							new EffectHandler({
								if: 'condition',
								run: ['action'],
							}),
						],
					},
					children: {
						s11: new AtomicState(),
					},
				}),
			},
		});
		state.monitor({
			conditionConfig: {
				notifyBefore: true,
			},
			children: {
				s1: {
					actions: {
						action: new Action({ run() {} }),
					},
					conditions: {
						condition: new Condition({
							run() {
								log.push('condition');
								return true;
							},
						}),
					},
				},
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'sub', // notifyBefore
			'condition',
			'sub',
		]);
	});
	it('does not override child with parent config', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			on: {
				event: [
					new EffectHandler({
						if: 'condition',
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({
					notifyBefore: false,
					run() {
						log.push('condition');
						return true;
					},
				}),
			},
			conditionConfig: {
				notifyBefore: true,
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual(['condition', 'sub']);
	});
	it('resolves condition using most specific configured name', () => {
		const state1 = new CompoundState({
			on: {
				event: [
					new EffectHandler({
						if: 'condition',
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new AtomicState(),
			},
		});
		state1.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({
					name: 'other-condition',
					run() {
						return true;
					},
				}),
			},
		});
		expect(() => state1.start()).toThrow(/unknown condition/);
		const state2 = new CompoundState({
			on: {
				event: [
					new EffectHandler({
						if: 'other-condition',
						run: ['action'],
					}),
				],
			},
			children: {
				s1: new AtomicState(),
			},
		});
		state2.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({
					name: 'other-condition',
					run() {
						return true;
					},
				}),
			},
		});
		expect(() => state2.start()).not.toThrow();
	});
	it('sets state condition during condition', () => {
		const condition = new Condition({
			notifyBefore: false,
			run() {
				expect(state.condition).toBe(condition);
				return true;
			},
		});
		const state = new CompoundState({
			entry: [
				new EffectHandler({
					if: 'condition',
					run: ['action'],
				}),
			],
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition,
			},
		});
		expect(state.condition).toBe(null);
		state.start();
		expect(state.condition).toBe(null);
	});
	it('ignores falsy handlers on entry', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			entry: [
				new EffectHandler({
					run: ['action'],
					if: 'isFalsy',
				}),
			],
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {
						actions.push('action');
					},
				}),
			},
			conditions: {
				isFalsy: new Condition({
					run() {
						return false;
					},
				}),
			},
		});
		state.start();
		expect(actions).toEqual([]);
	});
	it('runs truthy handlers on entry', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			entry: [
				new EffectHandler({
					run: ['action'],
					if: 'run',
				}),
			],
			children: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {
						actions.push('action');
					},
				}),
			},
			conditions: {
				run: new Condition({
					run() {
						return true;
					},
				}),
			},
		});
		state.start();
		expect(actions).toEqual(['action']);
	});
	it('ignores falsy handlers on exit', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
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
		state.monitor({
			actions: {
				action: new Action({
					run() {
						actions.push('action');
					},
				}),
			},
			conditions: {
				isFalsy: new Condition({
					run() {
						return false;
					},
				}),
			},
		});
		state.start();
		expect(actions).toEqual([]);
	});
	it('runs truthy handlers on exit', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
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
		state.monitor({
			children: {
				s1: {
					actions: {
						action: new Action({
							run() {
								actions.push('action');
							},
						}),
					},
					conditions: {
						isTruthy: new Condition({
							run() {
								return true;
							},
						}),
					},
				},
			},
		});
		state.start();
		expect(actions).toEqual(['action']);
	});
	it('ignores falsy handlers on dispatch', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			on: {
				myEvent: [
					new EffectHandler({
						run: ['action'],
						if: 'isFalsy',
					}),
				],
			},
			children: {
				s11: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {
						actions.push('action');
					},
				}),
			},
			conditions: {
				isFalsy: new Condition({
					run() {
						return false;
					},
				}),
			},
		});
		state.start();
		state.dispatch('myEvent');
		expect(actions).toEqual([]);
	});
	it('runs truthy handlers on dispatch', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			on: {
				myEvent: [
					new EffectHandler({
						run: ['action'],
						if: 'isTruthy',
					}),
				],
			},
			children: {
				s11: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {
						actions.push('action');
					},
				}),
			},
			conditions: {
				isTruthy: new Condition({
					run() {
						return true;
					},
				}),
			},
		});
		state.start();
		state.dispatch('myEvent');
		expect(actions).toEqual(['action']);
	});
	it('ignores falsy handlers on always', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			always: [
				new EffectHandler({
					run: ['action'],
					if: 'isFalsy',
				}),
			],
			children: {
				s11: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {
						actions.push('action');
					},
				}),
			},
			conditions: {
				isFalsy: new Condition({
					run() {
						return false;
					},
				}),
			},
		});
		state.start();
		expect(actions).toEqual([]);
	});
	it('runs truthy handlers on always', () => {
		/** @type {string[]} */
		const actions = [];
		const state = new CompoundState({
			always: [
				new EffectHandler({
					run: ['action'],
					if: 'isTruthy',
				}),
			],
			children: {
				s11: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {
						actions.push('action');
					},
				}),
			},
			conditions: {
				isTruthy: new Condition({
					run() {
						return true;
					},
				}),
			},
		});
		state.start();
		expect(actions).toEqual(['action']);
	});
});
