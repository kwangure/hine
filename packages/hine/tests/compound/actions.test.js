import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';

describe('actions', () => {
	it('runs initial entry then transient actions', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			name: 's0',
			always: [
				{
					actions: ['always0'],
				},
			],
			states: {
				s1: new CompoundState({
					always: [
						{
							actions: ['always1'],
						},
					],
					states: {
						s2: new AtomicState({
							always: [
								{
									actions: ['always2'],
								},
							],
						}),
					},
				}),
			},
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
			entry: [
				{
					actions: ['entry0'],
				},
			],
			states: {
				s1: {
					actions: {
						always1: new Action({
							run() {
								log.push('always1');
							},
						}),
						entry1: new Action({
							run() {
								log.push('entry1');
							},
						}),
					},
					entry: [
						{
							actions: ['entry1'],
						},
					],
					states: {
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
							},
							entry: [
								{
									actions: ['entry2'],
								},
							],
						},
					},
				},
			},
		});
		state.start();
		expect(log).toEqual(['entry0', 'entry1', 'entry2', 'always0', 'always1', 'always2']);
	});

	it('runs entry then always actions on transition', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			states: {
				a: new AtomicState({
					on: {
						event: [
							{
								transitionTo: 'b',
							},
						],
					},
				}),
				b: new CompoundState({
					always: [
						{
							actions: ['always0'],
						},
					],
					states: {
						s1: new CompoundState({
							always: [
								{
									actions: ['always1'],
								},
							],
							states: {
								s2: new AtomicState({
									always: [
										{
											actions: ['always2'],
										},
									],
								}),
							},
						}),
					},
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
					entry: [
						{
							actions: ['entry0'],
						},
					],
					states: {
						s1: {
							actions: {
								always1: new Action({
									run() {
										log.push('always1');
									},
								}),
								entry1: new Action({
									run() {
										log.push('entry1');
									},
								}),
							},
							entry: [
								{
									actions: ['entry1'],
								},
							],
							states: {
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
									},
									entry: [
										{
											actions: ['entry2'],
										},
									],
								},
							},
						},
					},
				},
			},
		});
		state.start();
		state.dispatch('event');
		expect(log).toEqual(['entry0', 'entry1', 'entry2', 'always0', 'always1', 'always2']);
	});

	it('runs exit actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			states: {
				s1: new CompoundState({
					on: {
						event: [
							{
								transitionTo: 's2',
							},
						],
					},
					states: {
						s11: new CompoundState({
							states: {
								s111: new AtomicState(),
							},
						}),
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
			exit: [
				{
					actions: ['exit0'],
				},
			],
			states: {
				s1: {
					actions: {
						exit1: new Action({
							run() {
								log.push('exit1');
							},
						}),
					},
					exit: [
						{
							actions: ['exit1'],
						},
					],
					states: {
						s11: {
							actions: {
								exit11: new Action({
									run() {
										log.push('exit11');
									},
								}),
							},
							exit: [
								{
									actions: ['exit11'],
								},
							],
							states: {
								s111: {
									actions: {
										exit111: new Action({
											run() {
												log.push('exit111');
											},
										}),
									},
									exit: [
										{
											actions: ['exit111'],
										},
									],
								},
							},
						},
					},
				},
			},
		});
		state.start();
		log.length = 0;

		state.dispatch('event');
		expect(log).toEqual(['exit111', 'exit11', 'exit1']);
	});

	it('runs on actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			on: {
				event: [
					{
						actions: ['on0'],
					},
				],
			},
			states: {
				s1: new CompoundState({
					on: {
						event: [
							{
								actions: ['on1'],
							},
						],
					},
					states: {
						s11: new CompoundState({
							on: {
								event: [
									{
										actions: ['on11'],
									},
								],
							},
							states: {
								s111: new AtomicState({
									on: {
										event: [
											{
												actions: ['on111'],
											},
										],
									},
								}),
							},
						}),
					},
				}),
				s2: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				on0: new Action({
					run() {
						log.push('on0');
					},
				}),
			},
			states: {
				s1: {
					actions: {
						on1: new Action({
							run() {
								log.push('on1');
							},
						}),
					},
					states: {
						s11: {
							actions: {
								on11: new Action({
									run() {
										log.push('on11');
									},
								}),
							},
							states: {
								s111: {
									actions: {
										on111: new Action({
											run() {
												log.push('on111');
											},
										}),
									},
								},
							},
						},
					},
				},
			},
		});
		state.start();
		log.length = 0;

		state.dispatch('event');
		expect(log).toEqual(['on111', 'on11', 'on1', 'on0']);
	});

	it('interleaves on actions with always actions', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			always: [
				{
					actions: ['always0'],
				},
			],
			on: {
				event: [
					{
						actions: ['on0'],
					},
				],
			},
			states: {
				s1: new CompoundState({
					always: [
						{
							actions: ['always1'],
						},
					],
					on: {
						event: [
							{
								actions: ['on1'],
							},
						],
					},
					states: {
						s11: new CompoundState({
							always: [
								{
									actions: ['always11'],
								},
							],
							on: {
								event: [
									{
										actions: ['on11'],
									},
								],
							},
							states: {
								s111: new AtomicState({
									always: [
										{
											actions: ['always111'],
										},
									],
									on: {
										event: [
											{
												actions: ['on111'],
											},
										],
									},
								}),
							},
						}),
					},
				}),
				s2: new AtomicState(),
			},
		});
		state.monitor({
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
			states: {
				s1: {
					actions: {
						always1: new Action({
							run() {
								log.push('always1');
							},
						}),
						on1: new Action({
							run() {
								log.push('on1');
							},
						}),
					},
					states: {
						s11: {
							actions: {
								always11: new Action({
									run() {
										log.push('always11');
									},
								}),
								on11: new Action({
									run() {
										log.push('on11');
									},
								}),
							},
							states: {
								s111: {
									actions: {
										always111: new Action({
											run() {
												log.push('always111');
											},
										}),
										on111: new Action({
											run() {
												log.push('on111');
											},
										}),
									},
								},
							},
						},
					},
				},
			},
		});
		state.start();
		log.length = 0;

		state.dispatch('event');
		expect(log).toEqual([
			'on111',
			'always111',
			'on11',
			'always11',
			'on1',
			'always1',
			'on0',
			'always0',
		]);
	});

	it('runs exit, transition, entry then always actions', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			always: [
				{
					actions: ['always0'],
				},
			],
			states: {
				s1: new CompoundState({
					on: {
						event: [
							{
								transitionTo: 's2',
								actions: ['on1'],
							},
						],
					},
					states: {
						s11: new CompoundState({
							states: {
								s111: new AtomicState(),
							},
						}),
					},
				}),
				s2: new CompoundState({
					always: [
						{
							actions: ['always2'],
						},
					],
					states: {
						s21: new CompoundState({
							always: [
								{
									actions: ['always21'],
								},
							],
							states: {
								s211: new AtomicState(),
							},
						}),
					},
				}),
			},
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
				exit0: new Action({
					run() {
						log.push('exit0');
					},
				}),
				on1: new Action({
					run() {
						log.push('on1');
					},
				}),
			},
			entry: [
				{
					actions: ['entry0'],
				},
			],
			exit: [
				{
					actions: ['exit0'],
				},
			],
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
					exit: [
						{
							actions: ['exit1'],
						},
					],
					states: {
						s11: {
							actions: {
								exit11: new Action({
									run() {
										log.push('exit11');
									},
								}),
								on11: new Action({
									run() {
										log.push('on11');
									},
								}),
							},
							exit: [
								{
									actions: ['exit11'],
								},
							],
						},
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
					entry: [
						{
							actions: ['entry2'],
						},
					],
					states: {
						s21: {
							actions: {
								always21: new Action({
									run() {
										log.push('always21');
									},
								}),
								entry21: new Action({
									run() {
										log.push('entry21');
									},
								}),
								on21: new Action({
									run() {
										log.push('on21');
									},
								}),
							},
							entry: [
								{
									actions: ['entry21'],
								},
							],
						},
					},
				},
			},
		});
		state.start();
		log.length = 0;

		state.dispatch('event');
		expect(log).toEqual([
			'exit11',
			'exit1',
			'on1',
			'entry2',
			'entry21',
			'always2',
			'always21',
			'always0',
		]);
	});

	it('runs always actions on unhandled events', () => {
		let alwaysCount = 0;
		const state = new CompoundState({
			states: {
				current: new CompoundState({
					always: [
						{
							actions: ['always'],
						},
					],
					states: {
						s: new AtomicState(),
					},
				}),
			},
		});
		state.monitor({
			states: {
				current: {
					actions: {
						always: new Action({
							run() {
								alwaysCount++;
							},
						}),
					},
				}
			}
		});
		state.start();
		expect(alwaysCount).toBe(1);

		state.dispatch('non-existent');
		expect(alwaysCount).toBe(2);
	});

	it('runs actions on parents', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			name: 's0',
			states: {
				s1: new CompoundState({
					always: [
						{
							actions: ['always'],
						},
					],
					on: {
						event: [
							{
								transitionTo: 's2',
								actions: ['on'],
							},
						],
					},
					states: {
						s11: new AtomicState(),
					},
				}),
				s2: new CompoundState({
					states: {
						s21: new AtomicState(),
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
			states: {
				s1: {
					entry: [
						{
							actions: ['entry'],
						},
					],
					exit: [
						{
							actions: ['exit'],
						},
					],
				},
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
			states: {
				s1: new CompoundState({
					always: [
						{
							actions: ['always'],
						},
					],
					on: {
						event: [
							{
								transitionTo: 's2',
								actions: ['on'],
							},
						],
					},
					states: {
						s11: new AtomicState(),
					},
				}),
				s2: new CompoundState({
					states: {
						s21: new AtomicState(),
					},
				}),
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
					entry: [
						{
							actions: ['entry'],
						},
					],
					exit: [
						{
							actions: ['exit'],
						},
					],
				},
			},
		});
		state.start();

		state.dispatch('event');
		expect(log).toEqual(['entry', 'always', 'exit', 'on']);
	});
	it('runs transitions in always handlers', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			states: {
				s1: new CompoundState({
					on: {
						event: [
							{
								transitionTo: 's2',
								actions: ['transition1'],
							},
						],
					},
					states: {
						s11: new AtomicState(),
					},
				}),
				s2: new CompoundState({
					always: [
						{
							transitionTo: 's1',
							actions: ['always2'],
						},
					],
					states: {
						s21: new AtomicState(),
					},
				}),
			},
		});
		state.monitor({
			states: {
				s1: {
					actions: {
						entry1: new Action({
							run() {
								log.push('entry1');
							},
						}),
						transition1: new Action({
							run() {
								log.push('transition1');
							},
						}),
					},
					entry: [
						{
							actions: ['entry1'],
						},
					],
				},
				s2: {
					actions: {
						always2: new Action({
							run() {
								log.push('always2');
							},
						}),
					},
				},
			},
		});
		state.start();

		state.dispatch('event');
		expect(state.state?.name).toEqual('s1');
		expect(log).toEqual(['entry1', 'transition1', 'always2', 'entry1']);
	});
	it('calls actions with self reference', () => {
		const action = new Action({
			run(value) {
				expect(this).toBe(undefined);
				expect(value).toBe(action);
			},
		});
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action,
			},
			entry: [
				{
					actions: ['action'],
				},
			],
		});
		state.start();
	});
	it('calls subscribers before action', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			on: {
				event: [
					{
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
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
		const state = new CompoundState({
			on: {
				event: [
					{
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
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
		const state = new CompoundState({
			actionConfig: {
				notifyBefore: true,
			},
			on: {
				event: [
					{
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
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
		const state = new CompoundState({
			actionConfig: {
				notifyBefore: true,
			},
			on: {
				event: [
					{
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
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
			actionConfig: {
				notifyBefore: true,
			},
			states: {
				s1: new CompoundState({
					on: {
						event: [
							{
								actions: ['action'],
							},
						],
					},
					states: {
						s11: new AtomicState(),
					},
				}),
			},
		});
		state.monitor({
			states: {
				s1: {
					actions: {
						action: new Action({
							run() {
								log.push('action');
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
			'action',
			'sub',
		]);
	});
	it('resolves action using most specific configured name', () => {
		const state = new CompoundState({
			on: {
				event: [
					{
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
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
		const state2 = new CompoundState({
			on: {
				event: [
					{
						actions: ['other-action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
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
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action,
			},
			entry: [
				{
					actions: ['action'],
				},
			],
		});
		expect(state.action).toBe(null);
		state.start();
		expect(state.action).toBe(null);
	});
	it('exposes actions inside actions', () => {
		const action2 = new Action({
			run: () => 'test',
		});
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
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
			entry: [
				{
					actions: ['action1'],
				},
			],
		});
		state.start();
	});
	it('calls actions with value', () => {
		const state = new CompoundState({
			on: {
				event: [{ actions: ['action']}],
			},
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run({ value }) {
						expect(value).toBe('my-value');
					},
				}),
			},
		});
		state.start();

		state.dispatch('event', 'my-value');
	});
});
