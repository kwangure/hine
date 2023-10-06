import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('actions', () => {
	it('runs initial entry then transient actions', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			name: 's0',
			always: {
				run: ['always0'],
			},
			entry: {
				run: ['entry0'],
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
						event: {
							goto: 'b',
						},
					},
				}),
				b: new AtomicState({
					always: {
						run: ['always0'],
					},
					entry: {
						run: ['entry0'],
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
			exit: {
				run: ['exit0'],
			},
			children: {
				s1: new AtomicState({
					exit: {
						run: ['exit1'],
					},
					on: {
						event: {
							goto: 's2',
						},
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
				event: {
					run: ['on0'],
				},
			},
		});
		machine.resolve({
			actions: {
				on0() {
					log.push('on0');
				},
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
			always: {
				run: ['always0'],
			},
			on: {
				event: {
					run: ['on0'],
				},
			},
		});
		machine.resolve({
			actions: {
				always0() {
					log.push('always0');
				},
				on0() {
					log.push('on0');
				},
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
					exit: {
						run: ['exit1'],
					},
					on: {
						event: {
							goto: 's2',
							run: ['on1'],
						},
					},
				}),
				s2: new AtomicState({
					always: {
						run: ['always2'],
					},
					entry: {
						run: ['entry2'],
					},
				}),
			},
		});
		machine.resolve({
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
			always: {
				run: ['always'],
			},
		});
		state.resolve({
			actions: {
				always() {
					alwaysCount++;
				},
			},
		});
		expect(alwaysCount).toBe(1);

		// @ts-expect-error
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
							always: {
								run: ['always'],
							},
							entry: {
								run: ['entry'],
							},
							exit: {
								run: ['exit'],
							},
							on: {
								event: {
									goto: 's12',
									run: ['on'],
								},
							},
						}),
						s12: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve({
			actions: {
				always() {
					log.push('always');
				},
				entry() {
					log.push('entry');
				},
				exit() {
					log.push('exit');
				},
				on() {
					log.push('on');
				},
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
					always: {
						run: ['always'],
					},
					entry: {
						run: ['entry'],
					},
					exit: {
						run: ['exit'],
					},
					on: {
						event: {
							goto: 's2',
							run: ['on'],
						},
					},
				}),
				s2: new AtomicState({}),
			},
		});
		state.resolve({
			actions: {
				always() {
					log.push('not always');
				},
				entry() {
					log.push('not entry');
				},
				exit() {
					log.push('not exit');
				},
				on() {
					log.push('not on');
				},
			},
			children: {
				s1: {
					actions: {
						always() {
							log.push('always');
						},
						entry() {
							log.push('entry');
						},
						exit() {
							log.push('exit');
						},
						on() {
							log.push('on');
						},
					},
				},
			},
		});

		state.dispatch('event');
		expect(log).toEqual(['entry', 'always', 'exit', 'on']);
	});
	it('sets state action during action', () => {
		const state = new AtomicState({
			entry: {
				run: ['action'],
			},
		});
		state.resolve({
			actions: {
				action(action) {
					expect(state.action).toBe(action);
				},
			},
		});
		expect(state.action).toBe(null);
	});
	it('exposes actions inside actions', () => {
		const state = new AtomicState({
			entry: {
				run: ['action1'],
			},
		});
		state.resolve({
			actions: {
				action1({ ownerState }) {
					expect(() => ownerState?.actions.action2).not.toThrow();
					expect(ownerState?.actions.action2.run()).toBe('test');
					return true;
				},
				action2: () => 'test',
			},
		});
	});
	it('calls actions with value', () => {
		const state = new AtomicState({
			on: {
				event: { run: ['action'] },
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
		const state = new AtomicState({
			entry: {
				run: ['missing'],
			},
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
	it('throws on missing exit actions', () => {
		const state = new AtomicState({
			exit: {
				run: ['missing'],
			},
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
	it('throws on missing always actions', () => {
		const state = new AtomicState({
			always: {
				run: ['missing'],
			},
		});
		expect(() => state.resolve()).toThrow("'missing'");
	});
});
