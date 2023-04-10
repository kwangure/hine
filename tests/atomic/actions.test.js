import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';

describe('actions', () => {
	it('runs initial entry then transient actions', () => {
		/** @type {string[]} */
		const log = [];
		new AtomicState({
			name: 's0',
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
			always: [{
				actions: ['always0'],
			}],
			entry: [{
				actions: ['entry0'],
			}],
		}).start();
		expect(log).toEqual(['entry0', 'always0']);
	});

	it('runs entry then always actions on transition', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			states: {
				a: new AtomicState({
					on: {
						event: [{
							transitionTo: 'b',
						}],
					},
				}),
				b: new AtomicState({
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
					always: [{
						actions: ['always0'],
					}],
					entry: [{
						actions: ['entry0'],
					}],
				}),
			},
		}).start();
		machine.dispatch('event');
		expect(log).toEqual(['entry0', 'always0']);
	});

	it('runs exit actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			actions: {
				exit0: new Action({
					run() {
						log.push('exit0');
					},
				}),
			},
			exit: [{
				actions: ['exit0'],
			}],
			states: {
				s1: new AtomicState({
					actions: {
						exit1: new Action({
							run() {
								log.push('exit1');
							},
						}),
					},
					exit: [{
						actions: ['exit1'],
					}],
					on: {
						event: [{
							transitionTo: 's2',
						}],
					},
				}),
				s2: new AtomicState(),
			},
		}).start();
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual([
			'exit1',
		]);
	});

	it('runs on actions', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new AtomicState({
			actions: {
				on0: new Action({
					run() {
						log.push('on0');
					},
				}),
			},
			on: {
				event: [{
					actions: ['on0'],
				}],
			},
		}).start();
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual([
			'on0',
		]);
	});

	it('runs on actions then always actions', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new AtomicState({
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
			always: [{
				actions: ['always0'],
			}],
			on: {
				event: [{
					actions: ['on0'],
				}],
			},
		}).start();
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual([
			'on0',
			'always0',
		]);
	});

	it('runs exit, transition, entry then always actions', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			states: {
				s1: new AtomicState({
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
					exit: [{
						actions: ['exit1'],
					}],
					on: {
						event: [{
							transitionTo: 's2',
							actions: ['on1'],
						}],
					},
				}),
				s2: new AtomicState({
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
					always: [{
						actions: ['always2'],
					}],
					entry: [{
						actions: ['entry2'],
					}],
				}),
			},
		}).start();
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual([
			'exit1',
			'on1',
			'entry2',
			'always2',
		]);
	});

	it('runs always actions on unhandled events', () => {
		let alwaysCount = 0;
		const machine = new AtomicState({
			always: [{
				actions: ['always'],
			}],
			actions: {
				always: new Action({
					run() {
						alwaysCount++;
					},
				}),
			},
		}).start();
		expect(alwaysCount).toBe(1);

		machine.dispatch('non-existent');
		expect(alwaysCount).toBe(2);
	});

	it('runs actions on ancestors', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			name: 's0',
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
				s1: new CompoundState({
					states: {
						s11: new AtomicState({
							always: [{
								actions: ['always'],
							}],
							entry: [{
								actions: ['entry'],
							}],
							exit: [{
								actions: ['exit'],
							}],
							on: {
								event: [{
									transitionTo: 's12',
									actions: ['on'],
								}],
							},
						}),
						s12: new AtomicState(),
					},
				}),
			},
		}).start();

		machine.dispatch('event');
		expect(log).toEqual(['entry', 'always', 'exit', 'on']);
	});

	it('does not run parent actions if own action matches', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			name: 's0',
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
				s1: new AtomicState({
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
					always: [{
						actions: ['always'],
					}],
					entry: [{
						actions: ['entry'],
					}],
					exit: [{
						actions: ['exit'],
					}],
					on: {
						event: [{
							transitionTo: 's2',
							actions: ['on'],
						}],
					},
				}),
				s2: new AtomicState(),
			},
		}).start();

		machine.dispatch('event');
		expect(log).toEqual(['entry', 'always', 'exit', 'on']);
	});
	it('calls actions in machine context', () => {
		const state = new AtomicState({
			actions: {
				action: new Action({
					run() {
						expect(this).toBe(state);
					},
				}),
			},
			entry: [{
				actions: ['action'],
			}],
		});
		state.start();
	});
});
