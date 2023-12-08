import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('actions', () => {
	it('runs initial entry then transient actions', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			name: 's0',
			always: {
				run: ['always0'],
			},
			entry: {
				run: ['entry0'],
			},
			children: {
				s1: new CompoundState({
					always: {
						run: ['always1'],
					},
					entry: {
						run: ['entry1'],
					},
					children: {
						s2: new AtomicState({
							always: {
								run: ['always2'],
							},
							entry: {
								run: ['entry2'],
							},
						}),
					},
				}),
			},
		});
		state.resolve({
			actions: {
				always0() {
					log.push('always0');
				},
				entry0() {
					log.push('entry0');
				},
			},
			children: {
				s1: {
					actions: {
						always1() {
							log.push('always1');
						},
						entry1() {
							log.push('entry1');
						},
					},
					children: {
						s2: {
							actions: {
								always2() {
									log.push('always2');
								},
								entry2() {
									log.push('entry2');
								},
							},
						},
					},
				},
			},
		});
		expect(log).toEqual([
			'entry0',
			'entry1',
			'entry2',
			'always0',
			'always1',
			'always2',
		]);
	});

	it('runs entry then always actions on transition', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			children: {
				a: new AtomicState({
					on: {
						event: {
							goto: 'b',
						},
					},
				}),
				b: new CompoundState({
					always: {
						run: ['always0'],
					},
					entry: {
						run: ['entry0'],
					},
					children: {
						s1: new CompoundState({
							always: {
								run: ['always1'],
							},
							entry: {
								run: ['entry1'],
							},
							children: {
								s2: new AtomicState({
									always: {
										run: ['always2'],
									},
									entry: {
										run: ['entry2'],
									},
								}),
							},
						}),
					},
				}),
			},
		});
		state.resolve({
			children: {
				b: {
					actions: {
						always0() {
							log.push('always0');
						},

						entry0() {
							log.push('entry0');
						},
					},
					children: {
						s1: {
							actions: {
								always1() {
									log.push('always1');
								},
								entry1() {
									log.push('entry1');
								},
							},
							children: {
								s2: {
									actions: {
										always2() {
											log.push('always2');
										},
										entry2() {
											log.push('entry2');
										},
									},
								},
							},
						},
					},
				},
			},
		});
		state.dispatch('event');
		expect(log).toEqual([
			'entry0',
			'entry1',
			'entry2',
			'always0',
			'always1',
			'always2',
		]);
	});

	it('runs exit actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			exit: {
				run: ['exit0'],
			},
			children: {
				s1: new CompoundState({
					exit: {
						run: ['exit1'],
					},
					on: {
						event: {
							goto: 's2',
						},
					},
					children: {
						s11: new CompoundState({
							exit: {
								run: ['exit11'],
							},
							children: {
								s111: new AtomicState({
									exit: {
										run: ['exit111'],
									},
								}),
							},
						}),
					},
				}),
				s2: new AtomicState({}),
			},
		});
		state.resolve({
			actions: {
				exit0() {
					log.push('exit0');
				},
			},
			children: {
				s1: {
					actions: {
						exit1() {
							log.push('exit1');
						},
					},
					children: {
						s11: {
							actions: {
								exit11() {
									log.push('exit11');
								},
							},
							children: {
								s111: {
									actions: {
										exit111() {
											log.push('exit111');
										},
									},
								},
							},
						},
					},
				},
			},
		});
		log.length = 0;

		state.dispatch('event');
		expect(log).toEqual(['exit111', 'exit11', 'exit1']);
	});

	it('runs on actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			on: {
				event: {
					run: ['on0'],
				},
			},
			children: {
				s1: new CompoundState({
					on: {
						event: {
							run: ['on1'],
						},
					},
					children: {
						s11: new CompoundState({
							on: {
								event: {
									run: ['on11'],
								},
							},
							children: {
								s111: new AtomicState({
									on: {
										event: {
											run: ['on111'],
										},
									},
								}),
							},
						}),
					},
				}),
				s2: new AtomicState({}),
			},
		});
		state.resolve({
			actions: {
				on0() {
					log.push('on0');
				},
			},
			children: {
				s1: {
					actions: {
						on1() {
							log.push('on1');
						},
					},
					children: {
						s11: {
							actions: {
								on11() {
									log.push('on11');
								},
							},
							children: {
								s111: {
									actions: {
										on111() {
											log.push('on111');
										},
									},
								},
							},
						},
					},
				},
			},
		});
		log.length = 0;

		state.dispatch('event');
		expect(log).toEqual(['on111', 'on11', 'on1', 'on0']);
	});

	it('interleaves on actions with always actions', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			always: {
				run: ['always0'],
			},
			on: {
				event: {
					run: ['on0'],
				},
			},
			children: {
				s1: new CompoundState({
					always: {
						run: ['always1'],
					},
					on: {
						event: {
							run: ['on1'],
						},
					},
					children: {
						s11: new CompoundState({
							always: {
								run: ['always11'],
							},
							on: {
								event: {
									run: ['on11'],
								},
							},
							children: {
								s111: new AtomicState({
									always: {
										run: ['always111'],
									},
									on: {
										event: {
											run: ['on111'],
										},
									},
								}),
							},
						}),
					},
				}),
				s2: new AtomicState({}),
			},
		});
		state.resolve({
			actions: {
				always0() {
					log.push('always0');
				},
				on0() {
					log.push('on0');
				},
			},
			children: {
				s1: {
					actions: {
						always1() {
							log.push('always1');
						},

						on1() {
							log.push('on1');
						},
					},
					children: {
						s11: {
							actions: {
								always11() {
									log.push('always11');
								},
								on11() {
									log.push('on11');
								},
							},
							children: {
								s111: {
									actions: {
										always111() {
											log.push('always111');
										},
										on111() {
											log.push('on111');
										},
									},
								},
							},
						},
					},
				},
			},
		});
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
			always: {
				run: ['always0'],
			},
			entry: {
				run: ['entry0'],
			},
			exit: {
				run: ['exit0'],
			},
			children: {
				s1: new CompoundState({
					exit: {
						run: ['exit1'],
					},
					on: {
						event: {
							goto: 's2',
							run: ['on1'],
						},
					},
					children: {
						s11: new CompoundState({
							exit: {
								run: ['exit11'],
							},
							children: {
								s111: new AtomicState({}),
							},
						}),
					},
				}),
				s2: new CompoundState({
					always: {
						run: ['always2'],
					},
					entry: {
						run: ['entry2'],
					},
					children: {
						s21: new CompoundState({
							always: {
								run: ['always21'],
							},
							entry: {
								run: ['entry21'],
							},
							children: {
								s211: new AtomicState({}),
							},
						}),
					},
				}),
			},
		});
		state.resolve({
			actions: {
				always0() {
					log.push('always0');
				},
				entry0() {
					log.push('entry0');
				},
				exit0() {
					log.push('exit0');
				},
				on1() {
					log.push('on1');
				},
			},
			children: {
				s1: {
					actions: {
						exit1() {
							log.push('exit1');
						},

						on1() {
							log.push('on1');
						},
					},
					children: {
						s11: {
							actions: {
								exit11() {
									log.push('exit11');
								},
								on11() {
									log.push('on11');
								},
							},
						},
					},
				},
				s2: {
					actions: {
						always2() {
							log.push('always2');
						},

						entry2() {
							log.push('entry2');
						},

						on2() {
							log.push('on2');
						},
					},
					children: {
						s21: {
							actions: {
								always21() {
									log.push('always21');
								},
								entry21() {
									log.push('entry21');
								},
								on21() {
									log.push('on21');
								},
							},
						},
					},
				},
			},
		});
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
			children: {
				current: new CompoundState({
					always: {
						run: ['always'],
					},
					children: {
						s: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve({
			children: {
				current: {
					actions: {
						always() {
							alwaysCount++;
						},
					},
				},
			},
		});
		expect(alwaysCount).toBe(1);

		// @ts-expect-error
		state.dispatch('non-existent');
		expect(alwaysCount).toBe(2);
	});

	it('runs transitions in always handlers', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					entry: {
						run: ['entry1'],
					},
					on: {
						event: {
							goto: 's2',
							run: ['transition1'],
						},
					},
					children: {
						s11: new AtomicState({}),
					},
				}),
				s2: new CompoundState({
					always: {
						goto: 's1',
						run: ['always2'],
					},
					children: {
						s21: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve({
			children: {
				s1: {
					actions: {
						entry1() {
							log.push('entry1');
						},

						transition1() {
							log.push('transition1');
						},
					},
				},
				s2: {
					actions: {
						always2() {
							log.push('always2');
						},
					},
				},
			},
		});

		state.dispatch('event');
		expect(state.matches('.s1')).toBe(true);
		expect(log).toEqual(['entry1', 'transition1', 'always2', 'entry1']);
	});
	it('exposes actions inside actions', () => {
		const state = new CompoundState({
			entry: {
				run: ['action1'],
			},
			children: {
				s1: new AtomicState({}),
			},
		});
		state.resolve({
			actions: {
				action1(state) {
					const { actions } = state;
					expect(() => actions.action2).not.toThrow();
					expect(actions.action2(state)).toBe('test');
					return true;
				},
				action2: () => 'test',
			},
		});
	});
	it('calls actions with value', () => {
		const state = new CompoundState({
			on: {
				event: { run: ['action'] },
			},
			children: {
				s1: new AtomicState({}),
			},
		});
		state.resolve({
			actions: {
				action({ event }) {
					expect(event?.value).toBe('my-value');
				},
			},
		});

		state.dispatch('event', 'my-value');
	});
	it('throws on missing entry actions', () => {
		const state = new CompoundState({
			entry: {
				run: ['missing'],
			},
			children: {
				s1: new AtomicState({}),
			},
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
	it('throws on missing exit actions', () => {
		const state = new CompoundState({
			children: {
				s1: new CompoundState({
					always: {
						goto: 's2',
					},
					exit: {
						run: ['missing'],
					},
					children: {
						s1: new AtomicState({}),
					},
				}),
				s2: new AtomicState({}),
			},
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
	it('throws on missing always actions', () => {
		const state = new CompoundState({
			always: {
				run: ['missing'],
			},
			children: {
				s1: new AtomicState({}),
			},
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
});
