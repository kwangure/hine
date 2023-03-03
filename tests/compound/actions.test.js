import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';

describe('actions', () => {
	it('runs initial entry then transient actions', () => {
		/** @type {string[]} */
		const log = [];
		new CompoundState({
			name: 's0',
			actions: {
				always0() {
					log.push('always0');
				},
				entry0() {
					log.push('entry0');
				},
			},
			always: [{
				actions: ['always0'],
			}],
			entry: [{
				actions: ['entry0'],
			}],
			states: {
				s1: new CompoundState({
					actions: {
						always1() {
							log.push('always1');
						},
						entry1() {
							log.push('entry1');
						},
					},
					always: [{
						actions: ['always1'],
					}],
					entry: [{
						actions: ['entry1'],
					}],
					states: {
						s2: new AtomicState({
							actions: {
								always2() {
									log.push('always2');
								},
								entry2() {
									log.push('entry2');
								},
							},
							always: [{
								actions: ['always2'],
							}],
							entry: [{
								actions: ['entry2'],
							}],
						}),
					},
				}),
			},
		})
			.resolve()
			.start();
		expect(log).toEqual(['entry0', 'always0', 'entry1', 'always1', 'entry2', 'always2']);
	});

	it('runs entry then transient actions on transition', () => {
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
				b: new CompoundState({
					name: 's0',
					actions: {
						always0() {
							log.push('always0');
						},
						entry0() {
							log.push('entry0');
						},
					},
					always: [{
						actions: ['always0'],
					}],
					entry: [{
						actions: ['entry0'],
					}],
					states: {
						s1: new CompoundState({
							actions: {
								always1() {
									log.push('always1');
								},
								entry1() {
									log.push('entry1');
								},
							},
							always: [{
								actions: ['always1'],
							}],
							entry: [{
								actions: ['entry1'],
							}],
							states: {
								s2: new AtomicState({
									actions: {
										always2() {
											log.push('always2');
										},
										entry2() {
											log.push('entry2');
										},
									},
									always: [{
										actions: ['always2'],
									}],
									entry: [{
										actions: ['entry2'],
									}],
								}),
							},
						}),
					},
				}),
			},
		})
			.resolve()
			.start();
		machine.dispatch('event');
		expect(log).toEqual(['entry0', 'always0', 'entry1', 'always1', 'entry2', 'always2']);
	});

	it.only('runs exit actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			actions: {
				exit0() {
					log.push('exit0');
				},
			},
			exit: [{
				actions: ['exit0'],
			}],
			states: {
				s1: new CompoundState({
					actions: {
						exit1() {
							log.push('exit1');
						},
					},
					exit: [{
						actions: ['exit1'],
					}],
					on: {
						event: [{
							transitionTo: 's2',
						}],
					},
					states: {
						s11: new CompoundState({
							actions: {
								exit11() {
									log.push('exit11');
								},
							},
							exit: [{
								actions: ['exit11'],
							}],
							states: {
								s111: new AtomicState({
									actions: {
										exit111() {
											log.push('exit111');
										},
									},
									exit: [{
										actions: ['exit111'],
									}],
								}),
							},
						}),
					},
				}),
				s2: new AtomicState(),
			},
		})
			.resolve()
			.start();
		log.length = 0;

		machine.dispatch('event');
		expect(log).toEqual([
			'exit111',
			'exit11',
			'exit1',
		]);
	});
});
