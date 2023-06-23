import { Action, AtomicState, CompoundState, Condition } from '../../src';
import { describe, expect, it } from 'vitest';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const cond2 = new Condition({
			run: () => false,
		});
		const state = new CompoundState({
			conditions: {
				cond1: new Condition({
					run({ ownerState }) {
						expect(() => ownerState?.conditions.cond2).not.toThrow();
						expect(ownerState?.conditions.cond2).toBe(cond2);
						expect(ownerState?.conditions.cond2.run()).toBe(false);
						return true;
					},
				}),
				cond2,
			},
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				do: new Action({
					run() {},
				}),
			},
			entry: [
				{
					condition: 'cond1',
					actions: ['do'],
				},
			],
		});
		state.start();
	});
	it('calls condition with self-reference', () => {
		const condition = new Condition({
			run(value) {
				expect(this).toBe(undefined);
				expect(value).toBe(condition);
				return true;
			},
		});
		const state = new CompoundState({
			conditions: {
				condition,
			},
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {},
				}),
			},
			entry: [
				{
					condition: 'condition',
					actions: ['action'],
				},
			],
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
			on: {
				event: [
					{
						condition: 'condition',
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
				action: new Action({ run() {} }),
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
			on: {
				event: [
					{
						condition: 'condition',
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
				action: new Action({ run() {} }),
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual([
			'condition',
			'sub', // notifyAfter
			'sub',
		]);
	});
	it('passes condition config from parent state', () => {
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
			on: {
				event: [
					{
						condition: 'condition',
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
				action: new Action({ run() {} }),
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
	it('passes condition config from grandparent state', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			conditionConfig: {
				notifyBefore: true,
			},
			states: {
				s1: new CompoundState({
					conditions: {
						condition: new Condition({
							run() {
								log.push('condition');
								return true;
							},
						}),
					},
					on: {
						event: [
							{
								condition: 'condition',
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
						action: new Action({ run() {} }),
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
			on: {
				event: [
					{
						condition: 'condition',
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
				action: new Action({ run() {} }),
			},
		});
		state.start();
		state.subscribe(() => log.push('sub'));
		log.length = 0;
		state.dispatch('event');
		expect(log).toEqual(['condition', 'sub']);
	});
	it('resolves condition using most specific configured name', () => {
		const state1 = new CompoundState({
			conditions: {
				condition: new Condition({
					name: 'other-condition',
					run() {
						return true;
					},
				}),
			},
			on: {
				event: [
					{
						condition: 'condition',
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
			},
		});
		state1.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		expect(() => state1.start()).toThrow(/unknown condition/);
		const state2 = new CompoundState({
			conditions: {
				condition: new Condition({
					name: 'other-condition',
					run() {
						return true;
					},
				}),
			},
			on: {
				event: [
					{
						condition: 'other-condition',
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
			},
		});
		state2.monitor({
			actions: {
				action: new Action({ run() {} }),
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
		const state = new CompoundState({
			conditions: {
				condition,
			},
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			entry: [
				{
					condition: 'condition',
					actions: ['action'],
				},
			],
		});
		expect(state.condition).toBe(null);
		state.start();
		expect(state.condition).toBe(null);
	});
});
