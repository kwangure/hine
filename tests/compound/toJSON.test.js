import { Action, AtomicState, CompoundState, Condition } from '../../src';
import { describe, expect, it } from 'vitest';

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
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.states).toEqual({
			s1: {
				name: 's1',
				type: 'atomic',
			},
		});
	});
	it('serializes always handlers', () => {
		const state = new CompoundState({
			always: [
				{
					actions: ['action'],
				},
			],
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({ run: () => true }),
			},
			states: {
				s1: new AtomicState(),
			},
		}).start();
		const json = state.toJSON();
		expect(json.always).toEqual([
			{
				actions: ['action'],
				condition: undefined,
				name: '0',
				transitionTo: undefined,
				type: 'handler',
			},
		]);
	});
	it('serializes entry handlers', () => {
		const state = new CompoundState({
			entry: [
				{
					actions: ['action'],
				},
			],
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({ run: () => true }),
			},
			states: {
				s1: new AtomicState(),
			},
		}).start();
		const json = state.toJSON();
		expect(json.entry).toEqual([
			{
				actions: ['action'],
				condition: undefined,
				name: '0',
				transitionTo: undefined,
				type: 'handler',
			},
		]);
	});
	it('serializes exit handlers', () => {
		const state = new CompoundState({
			exit: [
				{
					actions: ['action'],
				},
			],
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({ run: () => true }),
			},
			states: {
				s1: new AtomicState(),
			},
		}).start();
		const json = state.toJSON();
		expect(json.exit).toEqual([
			{
				actions: ['action'],
				condition: undefined,
				name: '0',
				transitionTo: undefined,
				type: 'handler',
			},
		]);
	});
	it('serializes on handlers', () => {
		const state = new CompoundState({
			on: {
				event: [{
					actions: ['action'],
				}],
			},
			actions: {
				action: new Action({ run() {} }),
			},
			conditions: {
				condition: new Condition({ run: () => true }),
			},
			states: {
				s1: new AtomicState(),
			},
		}).start();
		const json = state.toJSON();
		expect(json.on).toEqual({
			event: [{
				actions: ['action'],
				condition: undefined,
				name: '0',
				transitionTo: undefined,
				type: 'handler',
			}],
		});
	});
});
