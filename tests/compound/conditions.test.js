import { Action, AtomicState, CompoundState, Condition } from 'src';
import { describe, expect, it } from 'vitest';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const machine = new CompoundState({
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
				cond1: new Condition({
					run() {
						expect(this).toBe(machine);
						expect(() => this.conditions.cond2).not.toThrow();
						expect(this.conditions.cond2.run()).toBe(false);
						return true;
					},
				}),
				cond2: new Condition({
					run() {
						expect(this).toBe(machine);
						return false;
					},
				}),
			},
			states: {
				s1: new AtomicState(),
			},
		});
		machine.start();
	});
	it('calls condition in machine context', () => {
		const state = new CompoundState({
			conditions: {
				dummy: new Condition({
					run() {
						expect(this).toBe(state);
						return true;
					},
				}),
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
			states: {
				s1: new AtomicState(),
			},
		});
		state.start();
	});
	it('calls subscribers before condition', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
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
			states: {
				s1: new AtomicState(),
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
		const state = new CompoundState({
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
			states: {
				s1: new AtomicState(),
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
	it('passes condition config from parent', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
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
			states: {
				s1: new AtomicState(),
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
	it('does not override child with parent config', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
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
			states: {
				s1: new AtomicState(),
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
	it('sets state condition during condition', () => {
		const condition = new Condition({
			notifyBefore: false,
			run() {
				expect(this.condition).toBe(condition);
				return true;
			},
		});
		const state = new CompoundState({
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
			states: {
				s1: new AtomicState(),
			},
		});
		expect(state.condition).toBe(null);
		state.start();
		expect(state.condition).toBe(null);
	});
});
