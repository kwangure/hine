import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('start', () => {
	it('is resolves config idempotently', () => {
		/** @type {string[]} */
		const log = [];
		const state = new CompoundState({
			always: {
				run: ['always'],
			},
			children: {
				s1: new AtomicState({}),
			},
		});
		state.resolve({
			actions: {
				always() {
					log.push('always');
				},
			},
		});
		expect(log).toEqual(['always']);
	});
	it('sets initial state', () => {
		const machine = new CompoundState({
			children: {
				s1: new AtomicState({}),
			},
		});
		expect(machine.matches('.s1')).toBe(false);
		machine.resolve();
		expect(machine.matches('.s1')).toBe(true);
	});
	it('is resets to initial state', () => {
		const state = new CompoundState({
			children: {
				s1: new AtomicState({
					on: {
						event: { goto: 's2' },
					},
				}),
				s2: new AtomicState({}),
			},
		});
		state.resolve();
		expect(state.matches('.s1')).toBe(true);
		state.dispatch('event');
		expect(state.matches('.s2')).toBe(true);
		state.resolve();
		expect(state.matches('.s1')).toBe(true);
	});
});
