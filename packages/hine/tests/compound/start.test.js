import { Action, AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('start', () => {
	it('is resolves config idempotently', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			always: [
				{
					actions: ['always'],
				},
			],
			states: {
				s1: new AtomicState(),
			},
		});
		state.monitor({
			actions: {
				always: new Action({
					run() {
						log.push('always');
					},
				}),
			},
		});
		state.start();
		expect(log).toEqual(['always']);
		state.start();
		expect(log).toEqual(['always', 'always']);
	});
	it('sets initial state', () => {
		const state = new AtomicState();
		const machine = new CompoundState({
			states: {
				s1: state,
			},
		});
		expect(machine.state).toBe(null);
		machine.start();
		expect(machine.state).toBe(state);
	});
	it('is resets to initial state', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState({
					on: {
						event: [{ transitionTo: 's2' }],
					},
				}),
				s2: new AtomicState(),
			},
		});
		state.start();
		expect(state.state?.name).toEqual('s1');
		state.dispatch('event');
		expect(state.state?.name).toEqual('s2');
		state.start();
		expect(state.state?.name).toEqual('s1');
	});
});
