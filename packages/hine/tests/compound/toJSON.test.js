import { Action, AtomicState, CompoundState, Condition } from '../../src';
import { describe, expect, it } from 'vitest';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'state';
		const state = new CompoundState({
			name,
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.name).toBe(name);
	});
	it('defaults to empty string when missing name', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.type).toEqual('compound');
	});
	it('serializes nested states', () => {
		const state = new CompoundState({
			name: 'state',
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.states).toEqual({
			s1: {
				name: 's1',
				type: 'atomic',
				path: ['state', 's1'],
			},
		});
	});
	it('serializes always handlers', () => {
		const state = new CompoundState({
			always: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({ run: () => true }),
			},
		});
		state.start();
		const json = state.toJSON();
		expect(json.always).toEqual([
			{
				run: ['action'],
				condition: undefined,
				name: '0',
				transitionTo: undefined,
				type: 'effect',
				path: ['', '[0]'],
			},
		]);
	});
	it('serializes entry handlers', () => {
		const state = new CompoundState({
			entry: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({ run: () => true }),
			},
		});
		state.start();
		const json = state.toJSON();
		expect(json.entry).toEqual([
			{
				run: ['action'],
				condition: undefined,
				name: '0',
				transitionTo: undefined,
				type: 'effect',
				path: ['', '[0]'],
			},
		]);
	});
	it('serializes exit handlers', () => {
		const state = new CompoundState({
			exit: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({ run: () => true }),
			},
		});
		state.start();
		const json = state.toJSON();
		expect(json.exit).toEqual([
			{
				run: ['action'],
				condition: undefined,
				name: '0',
				transitionTo: undefined,
				type: 'effect',
				path: ['', '[0]'],
			},
		]);
	});
	it('serializes on handlers', () => {
		const state = new CompoundState({
			on: {
				event: [
					new EffectHandler2({
						run: ['action'],
					}),
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
			conditions: {
				condition: new Condition({ run: () => true }),
			},
		});
		state.start();
		const json = state.toJSON();
		expect(json.on).toEqual({
			event: [
				{
					run: ['action'],
					condition: undefined,
					name: '0',
					transitionTo: undefined,
					type: 'effect',
					path: ['', '[0]'],
				},
			],
		});
	});
	it('includes path', () => {
		const s1 = new CompoundState({
			states: {
				s11: new AtomicState(),
			},
		});
		new CompoundState({
			name: 'state',
			states: {
				s1,
			},
		});
		const json = s1.toJSON();
		expect(json.path).toEqual(['state', 's1']);
	});
});
