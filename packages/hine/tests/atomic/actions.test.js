import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';
import { EffectHandler } from '../../src/handler/effect.js';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('actions', () => {
	it('runs initial entry then transient actions', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			name: 's0',
			always: [
				new EffectHandler({
					run: ['always0'],
				}),
			],
			entry: [
				new EffectHandler({
					run: ['entry0'],
				}),
			],
		});
		state.resolve({
			actions: {
				always0: new ActionRunner({
					run() {
						log.push('always0');
					},
				}),
				entry0: new ActionRunner({
					run() {
						log.push('entry0');
					},
				}),
			},
		});
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
						new EffectHandler({
							run: ['always0'],
						}),
					],
					entry: [
						new EffectHandler({
							run: ['entry0'],
						}),
					],
				}),
			},
		});
		state.resolve({
			children: {
				b: {
					actions: {
						always0: new ActionRunner({
							run() {
								log.push('always0');
							},
						}),
						entry0: new ActionRunner({
							run() {
								log.push('entry0');
							},
						}),
					},
				},
			},
		});
		state.dispatch('event');
		expect(log).toEqual(['entry0', 'always0']);
	});

	it('runs exit actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			exit: [
				new EffectHandler({
					run: ['exit0'],
				}),
			],
			children: {
				s1: new AtomicState({
					exit: [
						new EffectHandler({
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
		state.resolve({
			actions: {
				exit0: new ActionRunner({
					run() {
						log.push('exit0');
					},
				}),
			},
			children: {
				s1: {
					actions: {
						exit1: new ActionRunner({
							run() {
								log.push('exit1');
							},
						}),
					},
				},
			},
		});
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
					new EffectHandler({
						run: ['on0'],
					}),
				],
			},
		});
		machine.resolve({
			actions: {
				on0: new ActionRunner({
					run() {
						log.push('on0');
					},
				}),
			},
		});
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual(['on0']);
	});

	it('runs on actions then always actions', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new AtomicState({
			always: [
				new EffectHandler({
					run: ['always0'],
				}),
			],
			on: {
				event: [
					new EffectHandler({
						run: ['on0'],
					}),
				],
			},
		});
		machine.resolve({
			actions: {
				always0: new ActionRunner({
					run() {
						log.push('always0');
					},
				}),
				on0: new ActionRunner({
					run() {
						log.push('on0');
					},
				}),
			},
		});
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
						new EffectHandler({
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
						new EffectHandler({
							run: ['always2'],
						}),
					],
					entry: [
						new EffectHandler({
							run: ['entry2'],
						}),
					],
				}),
			},
		});
		machine.resolve({
			children: {
				s1: {
					actions: {
						exit1: new ActionRunner({
							run() {
								log.push('exit1');
							},
						}),
						on1: new ActionRunner({
							run() {
								log.push('on1');
							},
						}),
					},
				},
				s2: {
					actions: {
						always2: new ActionRunner({
							run() {
								log.push('always2');
							},
						}),
						entry2: new ActionRunner({
							run() {
								log.push('entry2');
							},
						}),
						on2: new ActionRunner({
							run() {
								log.push('on2');
							},
						}),
					},
				},
			},
		});
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual(['exit1', 'on1', 'entry2', 'always2']);
	});

	it('runs always actions on unhandled events', () => {
		let alwaysCount = 0;
		const state = new AtomicState({
			always: [
				new EffectHandler({
					run: ['always'],
				}),
			],
		});
		state.resolve({
			actions: {
				always: new ActionRunner({
					run() {
						alwaysCount++;
					},
				}),
			},
		});
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
								new EffectHandler({
									run: ['always'],
								}),
							],
							entry: [
								new EffectHandler({
									run: ['entry'],
								}),
							],
							exit: [
								new EffectHandler({
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
		state.resolve({
			actions: {
				always: new ActionRunner({
					run() {
						log.push('always');
					},
				}),
				entry: new ActionRunner({
					run() {
						log.push('entry');
					},
				}),
				exit: new ActionRunner({
					run() {
						log.push('exit');
					},
				}),
				on: new ActionRunner({
					run() {
						log.push('on');
					},
				}),
			},
		});

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
						new EffectHandler({
							run: ['always'],
						}),
					],
					entry: [
						new EffectHandler({
							run: ['entry'],
						}),
					],
					exit: [
						new EffectHandler({
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
		state.resolve({
			actions: {
				always: new ActionRunner({
					run() {
						log.push('not always');
					},
				}),
				entry: new ActionRunner({
					run() {
						log.push('not entry');
					},
				}),
				exit: new ActionRunner({
					run() {
						log.push('not exit');
					},
				}),
				on: new ActionRunner({
					run() {
						log.push('not on');
					},
				}),
			},
			children: {
				s1: {
					actions: {
						always: new ActionRunner({
							run() {
								log.push('always');
							},
						}),
						entry: new ActionRunner({
							run() {
								log.push('entry');
							},
						}),
						exit: new ActionRunner({
							run() {
								log.push('exit');
							},
						}),
						on: new ActionRunner({
							run() {
								log.push('on');
							},
						}),
					},
				},
			},
		});

		state.dispatch('event');
		expect(log).toEqual(['entry', 'always', 'exit', 'on']);
	});
	it('calls actions with self-reference', () => {
		const action = new ActionRunner({
			run(value) {
				expect(this).toBe(undefined);
				expect(value).toBe(action);
			},
		});
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					run: ['action'],
				}),
			],
		});
		state.resolve({
			actions: {
				action,
			},
		});
	});
	it('calls subscribers before action', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			on: {
				event: [
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});
		state.resolve({
			actions: {
				action: new ActionRunner({
					notifyBefore: true,
					run() {
						log.push('action');
					},
				}),
			},
		});
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
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});
		state.resolve({
			actions: {
				action: new ActionRunner({
					notifyAfter: true,
					run() {
						log.push('action');
					},
				}),
			},
		});
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
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});
		state.resolve({
			actionConfig: {
				notifyBefore: true,
			},
			actions: {
				action: new ActionRunner({
					run() {
						log.push('action');
					},
				}),
			},
		});
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
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});
		state.resolve({
			actionConfig: {
				notifyBefore: true,
			},
			actions: {
				action: new ActionRunner({
					notifyBefore: false,
					run() {
						log.push('action');
					},
				}),
			},
		});
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
									new EffectHandler({
										run: ['action'],
									}),
								],
							},
						}),
					},
				}),
			},
		});
		state.resolve({
			actionConfig: {
				notifyBefore: true,
			},
			children: {
				s1: {
					children: {
						s11: {
							actions: {
								action: new ActionRunner({
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
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});

		expect(() =>
			state.resolve({
				actions: {
					action: new ActionRunner({
						name: 'other-action',
						run() {},
					}),
				},
			}),
		).toThrow(/unknown action/);
		const state2 = new AtomicState({
			on: {
				event: [
					new EffectHandler({
						run: ['other-action'],
					}),
				],
			},
		});

		expect(() =>
			state2.resolve({
				actions: {
					action: new ActionRunner({
						name: 'other-action',
						run() {},
					}),
				},
			}),
		).not.toThrow();
	});
	it('sets state action during action', () => {
		const action = new ActionRunner({
			notifyBefore: false,
			run() {
				expect(state.action).toBe(action);
			},
		});
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					run: ['action'],
				}),
			],
		});
		state.resolve({
			actions: {
				action,
			},
		});
		expect(state.action).toBe(null);
	});
	it('exposes actions inside actions', () => {
		const action2 = new ActionRunner({
			run: () => 'test',
		});
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					run: ['action1'],
				}),
			],
		});
		state.resolve({
			actions: {
				action1: new ActionRunner({
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
	});
	it('calls actions with value', () => {
		const state = new AtomicState({
			on: {
				event: [new EffectHandler({ run: ['action'] })],
			},
		});
		state.resolve({
			actions: {
				action: new ActionRunner({
					run({ event }) {
						expect(event?.value).toBe('my-value');
					},
				}),
			},
		});

		state.dispatch('event', 'my-value');
	});
	it('throws on missing entry actions', () => {
		const state = new AtomicState({
			entry: [
				new EffectHandler({
					run: ['missing'],
				}),
			],
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
	it('throws on missing exit actions', () => {
		const state = new AtomicState({
			exit: [
				new EffectHandler({
					run: ['missing'],
				}),
			],
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
	it('throws on missing always actions', () => {
		const state = new AtomicState({
			always: [
				new EffectHandler({
					run: ['missing'],
				}),
			],
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
});
