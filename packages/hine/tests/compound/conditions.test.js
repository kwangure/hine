import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';
import { EffectHandler } from '../../src/handler/effect.js';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
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
		state.resolve({
			actions: {
				action() {},
			},
			conditions: {
				condition: {
					notifyBefore: true,
					run() {
						log.push('condition');
						return true;
					},
				},
			},
		});
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
		state.resolve({
			actions: {
				action() {},
			},
			conditions: {
				condition: {
					notifyAfter: true,
					run() {
						log.push('condition');
						return true;
					},
				},
			},
		});
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
		state.resolve({
			actions: {
				action() {},
			},
			conditions: {
				condition() {
					log.push('condition');
					return true;
				},
			},
			conditionConfig: {
				notifyBefore: true,
			},
		});
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
		state.resolve({
			conditionConfig: {
				notifyBefore: true,
			},
			children: {
				s1: {
					actions: {
						action() {},
					},
					conditions: {
						condition() {
							log.push('condition');
							return true;
						},
					},
				},
			},
		});
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
		state.resolve({
			actions: {
				action() {},
			},
			conditions: {
				condition() {
					log.push('condition');
					return true;
				},
			},
			conditionConfig: {
				notifyBefore: true,
			},
		});
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual(['sub', 'condition', 'sub']);
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
		state.resolve({
			actions: {
				action() {
					actions.push('action');
				},
			},
			conditions: {
				run() {
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
});
