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
		expect(log).toEqual(['entry0', 'entry1', 'entry2', 'always0', 'always1', 'always2']);
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
		expect(log).toEqual(['entry0', 'entry1', 'entry2', 'always0', 'always1', 'always2']);
	});

	it('runs exit actions with leaves first and root last', () => {
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

	it('runs on actions with leaves first and root last', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			actions: {
				on0() {
					log.push('on0');
				},
			},
			on: {
				event: [{
					actions: ['on0'],
				}],
			},
			states: {
				s1: new CompoundState({
					actions: {
						on1() {
							log.push('on1');
						},
					},
					on: {
						event: [{
							actions: ['on1'],
						}],
					},
					states: {
						s11: new CompoundState({
							actions: {
								on11() {
									log.push('on11');
								},
							},
							on: {
								event: [{
									actions: ['on11'],
								}],
							},
							states: {
								s111: new AtomicState({
									actions: {
										on111() {
											log.push('on111');
										},
									},
									on: {
										event: [{
											actions: ['on111'],
										}],
									},
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
			'on111',
			'on11',
			'on1',
			'on0',
		]);
	});

	it('interleaves on actions with always actions', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			actions: {
				always0() {
					log.push('always0');
				},
				on0() {
					log.push('on0');
				},
			},
			always: [{
				actions: ['always0'],
			}],
			on: {
				event: [{
					actions: ['on0'],
				}],
			},
			states: {
				s1: new CompoundState({
					actions: {
						always1() {
							log.push('always1');
						},
						on1() {
							log.push('on1');
						},
					},
					always: [{
						actions: ['always1'],
					}],
					on: {
						event: [{
							actions: ['on1'],
						}],
					},
					states: {
						s11: new CompoundState({
							actions: {
								always11() {
									log.push('always11');
								},
								on11() {
									log.push('on11');
								},
							},
							always: [{
								actions: ['always11'],
							}],
							on: {
								event: [{
									actions: ['on11'],
								}],
							},
							states: {
								s111: new AtomicState({
									actions: {
										always111() {
											log.push('always111');
										},
										on111() {
											log.push('on111');
										},
									},
									always: [{
										actions: ['always111'],
									}],
									on: {
										event: [{
											actions: ['on111'],
										}],
									},
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
		const machine = new CompoundState({
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
				on0() {
					log.push('on0');
				},
			},
			always: [{
				actions: ['always0'],
			}],
			entry: [{
				actions: ['entry0'],
			}],
			exit: [{
				actions: ['exit0'],
			}],
			states: {
				s1: new CompoundState({
					actions: {
						exit1() {
							log.push('exit1');
						},
						on1() {
							log.push('on1');
						},
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
					states: {
						s11: new CompoundState({
							actions: {
								exit11() {
									log.push('exit11');
								},
								on11() {
									log.push('on11');
								},
							},
							exit: [{
								actions: ['exit11'],
							}],
							states: {
								s111: new AtomicState(),
							},
						}),
					},
				}),
				s2: new CompoundState({
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
					always: [{
						actions: ['always2'],
					}],
					entry: [{
						actions: ['entry2'],
					}],
					states: {
						s21: new CompoundState({
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
							always: [{
								actions: ['always21'],
							}],
							entry: [{
								actions: ['entry21'],
							}],
							states: {
								s211: new AtomicState(),
							},
						}),
					},
				}),
			},
		})
			.resolve()
			.start();
		log.length = 0;

		machine.dispatch('event');
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
		const machine = new CompoundState({
			states: {
				current: new CompoundState({
					always: [{
						actions: ['always'],
					}],
					actions: {
						always() {
							alwaysCount++;
						},
					},
					states: {
						s: new AtomicState(),
					},
				}),
			},
		})
			.resolve()
			.start();
		expect(alwaysCount).toBe(1);

		machine.dispatch('non-existent');
		expect(alwaysCount).toBe(2);
	});
});
