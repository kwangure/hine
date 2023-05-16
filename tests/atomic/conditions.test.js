import { Action, AtomicState, CompoundState, Condition } from '../../src';
import { describe, expect, it } from 'vitest';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const cond1 = new Condition({
			run() {
				expect(this).toBe(cond1);
				expect(() => this.ownerState?.conditions.cond2).not.toThrow();
				expect(this.ownerState?.conditions.cond2).toBe(cond2);
				expect(this.ownerState?.conditions.cond2.run()).toBe(false);
				return true;
			},
		});
		const cond2 = new Condition({
			run() {
				expect(this).toBe(cond2);
				return false;
			},
		});
		new AtomicState({
			entry: [{
				condition: 'cond1',
				actions: ['do'],
			}],
			actions: {
				do: new Action({
					run() {},
				}),
			},
			conditions: {
				cond1,
				cond2,
			},
		}).start();
	});
	it('calls condition in machine context', () => {
		const dummy = new Condition({
			run() {
				expect(this).toBe(dummy);
				return true;
			},
		});
		const state = new AtomicState({
			conditions: {
				dummy,
			},
			actions: {
				action: new Action({
					run() {},
				}),
			},
			entry: [{
				condition: 'dummy',
				actions: ['action'],
			}],
		});
		state.start();
	});
	it('calls subscribers before condition', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			conditions: {
				condition: new Condition({
					notifyBefore: true,
					run() {
						log.push('condition');
						return true;
					},
				}),
			},
			actions: {
				action: new Action({ run() {} }),
			},
			on: {
				event: [{
					condition: 'condition',
					actions: ['action'],
				}],
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
		const state = new AtomicState({
			conditions: {
				condition: new Condition({
					notifyAfter: true,
					run() {
						log.push('condition');
						return true;
					},
				}),
			},
			actions: {
				action: new Action({ run() {} }),
			},
			on: {
				event: [{
					condition: 'condition',
					actions: ['action'],
				}],
			},
		}).start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'condition',
			'sub', // notifyAfter
			'sub',
		]);
	});
	it('passes action config from parent state', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			conditionConfig: {
				notifyBefore: true,
			},
			conditions: {
				condition: new Condition({
					run() {
						log.push('condition');
						return true;
					},
				}),
			},
			actions: {
				action: new Action({ run() {} }),
			},
			on: {
				event: [{
					condition: 'condition',
					actions: ['action'],
				}],
			},
		}).start();
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
			conditionConfig: {
				notifyBefore: true,
			},
			states: {
				s1: new CompoundState({
					states: {
						s11: new AtomicState({
							conditions: {
								condition: new Condition({
									run() {
										log.push('condition');
										return true;
									},
								}),
							},
							actions: {
								action: new Action({ run() {} }),
							},
							on: {
								event: [{
									condition: 'condition',
									actions: ['action'],
								}],
							},
						}),
					},
				}),
			},
		}).start();
		state.subscribe(() => {
			log.push('sub');
		});
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
		const state = new AtomicState({
			conditionConfig: {
				notifyBefore: true,
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
			actions: {
				action: new Action({ run() {} }),
			},
			on: {
				event: [{
					condition: 'condition',
					actions: ['action'],
				}],
			},
		}).start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'condition',
			'sub',
		]);
	});
	it('resolves condition using most specific configured name', () => {
		const state1 = new AtomicState({
			conditions: {
				condition: new Condition({
					name: 'other-condition',
					run() {
						return true;
					},
				}),
			},
			actions: {
				action: new Action({ run() {} }),
			},
			on: {
				event: [{
					condition: 'condition',
					actions: ['action'],
				}],
			},
		});
		expect(() => state1.start()).toThrow(/unknown condition/);
		const state2 = new AtomicState({
			conditions: {
				condition: new Condition({
					name: 'other-condition',
					run() {
						return true;
					},
				}),
			},
			actions: {
				action: new Action({ run() {} }),
			},
			on: {
				event: [{
					condition: 'other-condition',
					actions: ['action'],
				}],
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
		const state = new AtomicState({
			conditions: {
				condition,
			},
			actions: {
				action: new Action({ run() {} }),
			},
			entry: [{
				condition: 'condition',
				actions: ['action'],
			}],
		});
		expect(state.condition).toBe(null);
		state.start();
		expect(state.condition).toBe(null);
	});
});
