import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
import { EffectHandler2 } from '../../src/handler/effect.js';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('actions', () => {
	it('runs initial entry then transient actions', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			name: 's0',
			always: [
				new EffectHandler2({
					run: ['always0'],
				}),
			],
			entry: [
				new EffectHandler2({
					run: ['entry0'],
				}),
			],
		});
		state.monitor({
			actions: {
				always0: new Action({
					run() {
						log.push('always0');
					},
				}),
				entry0: new Action({
					run() {
						log.push('entry0');
					},
				}),
			},
		});
		state.start();
		expect(log).toEqual(['entry0', 'always0']);
	});

	it('runs entry then always actions on transition', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			children: {
				a: new AtomicState({
					on: {
						event: [
							new TransitionHandler({
								goto: 'b',
							}),
						],
					},
				}),
				b: new AtomicState({
					always: [
						new EffectHandler2({
							run: ['always0'],
						}),
					],
					entry: [
						new EffectHandler2({
							run: ['entry0'],
						}),
					],
				}),
			},
		});
		state.monitor({
			states: {
				b: {
					actions: {
						always0: new Action({
							run() {
								log.push('always0');
							},
						}),
						entry0: new Action({
							run() {
								log.push('entry0');
							},
						}),
					},
				},
			},
		});
		state.start();
		state.dispatch('event');
		expect(log).toEqual(['entry0', 'always0']);
	});

	it('runs exit actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			exit: [
				new EffectHandler2({
					run: ['exit0'],
				}),
			],
			children: {
				s1: new AtomicState({
					exit: [
						new EffectHandler2({
							run: ['exit1'],
						}),
					],
					on: {
						event: [
							new TransitionHandler({
								goto: 's2',
							}),
						],
					},
				}),
				s2: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				exit0: new Action({
					run() {
						log.push('exit0');
					},
				}),
			},
			states: {
				s1: {
					actions: {
						exit1: new Action({
							run() {
								log.push('exit1');
							},
						}),
					},
				},
			},
		});
		state.start();
		log.length = 0;

		state.dispatch('event');
		expect(log).toEqual(['exit1']);
	});

	it('runs on actions', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new AtomicState({
			on: {
				event: [
					new EffectHandler2({
						run: ['on0'],
					}),
				],
			},
		});
		machine.monitor({
			actions: {
				on0: new Action({
					run() {
						log.push('on0');
					},
				}),
			},
		});
		machine.start();
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual(['on0']);
	});

	it('runs on actions then always actions', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new AtomicState({
			always: [
				new EffectHandler2({
					run: ['always0'],
				}),
			],
			on: {
				event: [
					new EffectHandler2({
						run: ['on0'],
					}),
				],
			},
		});
		machine.monitor({
			actions: {
				always0: new Action({
					run() {
						log.push('always0');
					},
				}),
				on0: new Action({
					run() {
						log.push('on0');
					},
				}),
			},
		});
		machine.start();
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual(['on0', 'always0']);
	});

	it('runs exit, transition, entry then always actions', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			children: {
				s1: new AtomicState({
					exit: [
						new EffectHandler2({
							run: ['exit1'],
						}),
					],
					on: {
						event: [
							new TransitionHandler({
								goto: 's2',
								run: ['on1'],
							}),
						],
					},
				}),
				s2: new AtomicState({
					always: [
						new EffectHandler2({
							run: ['always2'],
						}),
					],
					entry: [
						new EffectHandler2({
							run: ['entry2'],
						}),
					],
				}),
			},
		});
		machine.monitor({
			states: {
				s1: {
					actions: {
						exit1: new Action({
							run() {
								log.push('exit1');
							},
						}),
						on1: new Action({
							run() {
								log.push('on1');
							},
						}),
					},
				},
				s2: {
					actions: {
						always2: new Action({
							run() {
								log.push('always2');
							},
						}),
						entry2: new Action({
							run() {
								log.push('entry2');
							},
						}),
						on2: new Action({
							run() {
								log.push('on2');
							},
						}),
					},
				},
			},
		});
		machine.start();
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual(['exit1', 'on1', 'entry2', 'always2']);
	});

	it('runs always actions on unhandled events', () => {
		let alwaysCount = 0;
		const state = new AtomicState({
			always: [
				new EffectHandler2({
					run: ['always'],
				}),
			],
		});
		state.monitor({
			actions: {
				always: new Action({
					run() {
						alwaysCount++;
					},
				}),
			},
		});
		state.start();
		expect(alwaysCount).toBe(1);

		state.dispatch('non-existent');
		expect(alwaysCount).toBe(2);
	});

	it('runs actions on ancestors', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			name: 's0',
			children: {
				s1: new CompoundState({
					children: {
						s11: new AtomicState({
							always: [
								new EffectHandler2({
									run: ['always'],
								}),
							],
							entry: [
								new EffectHandler2({
									run: ['entry'],
								}),
							],
							exit: [
								new EffectHandler2({
									run: ['exit'],
								}),
							],
							on: {
								event: [
									new TransitionHandler({
										goto: 's12',
										run: ['on'],
									}),
								],
							},
						}),
						s12: new AtomicState(),
					},
				}),
			},
		});
		state.monitor({
			actions: {
				always: new Action({
					run() {
						log.push('always');
					},
				}),
				entry: new Action({
					run() {
						log.push('entry');
					},
				}),
				exit: new Action({
					run() {
						log.push('exit');
					},
				}),
				on: new Action({
					run() {
						log.push('on');
					},
				}),
			},
		});
		state.start();

		state.dispatch('event');
		expect(log).toEqual(['entry', 'always', 'exit', 'on']);
	});

	it('does not run parent actions if own action matches', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			name: 's0',
			children: {
				s1: new AtomicState({
					always: [
						new EffectHandler2({
							run: ['always'],
						}),
					],
					entry: [
						new EffectHandler2({
							run: ['entry'],
						}),
					],
					exit: [
						new EffectHandler2({
							run: ['exit'],
						}),
					],
					on: {
						event: [
							new TransitionHandler({
								goto: 's2',
								run: ['on'],
							}),
						],
					},
				}),
				s2: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				always: new Action({
					run() {
						log.push('not always');
					},
				}),
				entry: new Action({
					run() {
						log.push('not entry');
					},
				}),
				exit: new Action({
					run() {
						log.push('not exit');
					},
				}),
				on: new Action({
					run() {
						log.push('not on');
					},
				}),
			},
			states: {
				s1: {
					actions: {
						always: new Action({
							run() {
								log.push('always');
							},
						}),
						entry: new Action({
							run() {
								log.push('entry');
							},
						}),
						exit: new Action({
							run() {
								log.push('exit');
							},
						}),
						on: new Action({
							run() {
								log.push('on');
							},
						}),
					},
				},
			},
		});
		state.start();

		state.dispatch('event');
		expect(log).toEqual(['entry', 'always', 'exit', 'on']);
	});
	it('calls actions with self-reference', () => {
		const action = new Action({
			run(value) {
				expect(this).toBe(undefined);
				expect(value).toBe(action);
			},
		});
		const state = new AtomicState({
			entry: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
		});
		state.monitor({
			actions: {
				action,
			},
		});
		state.start();
	});
	it('calls subscribers before action', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			on: {
				event: [
					new EffectHandler2({
						run: ['action'],
					}),
				],
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					notifyBefore: true,
					run() {
						log.push('action');
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
			'action',
			'sub',
		]);
	});
	it('calls subscribers after action', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			on: {
				event: [
					new EffectHandler2({
						run: ['action'],
					}),
				],
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					notifyAfter: true,
					run() {
						log.push('action');
					},
				}),
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'action',
			'sub', // notifyAfter
			'sub',
		]);
	});
	it('passes action config from parent', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			on: {
				event: [
					new EffectHandler2({
						run: ['action'],
					}),
				],
			},
		});
		state.monitor({
			actionConfig: {
				notifyBefore: true,
			},
			actions: {
				action: new Action({
					run() {
						log.push('action');
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
			'action',
			'sub',
		]);
	});
	it('does not override child with parent config', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			on: {
				event: [
					new EffectHandler2({
						run: ['action'],
					}),
				],
			},
		});
		state.monitor({
			actionConfig: {
				notifyBefore: true,
			},
			actions: {
				action: new Action({
					notifyBefore: false,
					run() {
						log.push('action');
					},
				}),
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual(['action', 'sub']);
	});
	it('passes condition config from grandparent state', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					children: {
						s11: new AtomicState({
							on: {
								event: [
									new EffectHandler2({
										run: ['action'],
									}),
								],
							},
						}),
					},
				}),
			},
		});
		state.monitor({
			actionConfig: {
				notifyBefore: true,
			},
			states: {
				s1: {
					states: {
						s11: {
							actions: {
								action: new Action({
									run() {
										log.push('action');
									},
								}),
							},
						},
					},
				},
			},
		});
		state.start();
		state.subscribe(() => {
			log.push('sub');
		});
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'sub', // notifyBefore
			'action',
			'sub',
		]);
	});
	it('resolves action using most specific configured name', () => {
		const state = new AtomicState({
			on: {
				event: [
					new EffectHandler2({
						run: ['action'],
					}),
				],
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					name: 'other-action',
					run() {},
				}),
			},
		});
		expect(() => state.start()).toThrow(/unknown action/);
		const state2 = new AtomicState({
			on: {
				event: [
					new EffectHandler2({
						run: ['other-action'],
					}),
				],
			},
		});
		state2.monitor({
			actions: {
				action: new Action({
					name: 'other-action',
					run() {},
				}),
			},
		});
		expect(() => state2.start()).not.toThrow();
	});
	it('sets state action during action', () => {
		const action = new Action({
			notifyBefore: false,
			run() {
				expect(state.action).toBe(action);
			},
		});
		const state = new AtomicState({
			entry: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
		});
		state.monitor({
			actions: {
				action,
			},
		});
		expect(state.action).toBe(null);
		state.start();
		expect(state.action).toBe(null);
	});
	it('exposes actions inside actions', () => {
		const action2 = new Action({
			run: () => 'test',
		});
		const state = new AtomicState({
			entry: [
				new EffectHandler2({
					run: ['action1'],
				}),
			],
		});
		state.monitor({
			actions: {
				action1: new Action({
					run({ ownerState }) {
						expect(() => ownerState?.actions.action2).not.toThrow();
						expect(ownerState?.actions.action2).toBe(action2);
						expect(ownerState?.actions.action2.run()).toBe('test');
						return true;
					},
				}),
				action2,
			},
		});
		state.start();
	});
	it('calls actions with value', () => {
		const state = new AtomicState({
			on: {
				event: [new EffectHandler2({ run: ['action'] })],
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run({ event }) {
						expect(event?.value).toBe('my-value');
					},
				}),
			},
		});
		state.start();

		state.dispatch('event', 'my-value');
	});
	it('throws on missing entry actions', () => {
		const state = new AtomicState({
			entry: [
				new EffectHandler2({
					run: ['missing'],
				}),
			],
		});
		expect(() => state.start()).toThrow("'missing'");
	});
	it('throws on missing exit actions', () => {
		const state = new AtomicState({
			exit: [
				new EffectHandler2({
					run: ['missing'],
				}),
			],
		});
		expect(() => state.start()).toThrow("'missing'");
	});
	it('throws on missing always actions', () => {
		const state = new AtomicState({
			always: [
				new EffectHandler2({
					run: ['missing'],
				}),
			],
		});
		expect(() => state.start()).toThrow("'missing'");
	});
});
