import { AtomicState, CompoundState } from 'src';
import { describe, expect, it } from 'vitest';

describe('start', () => {
	it('is resolves config idempotently', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new CompoundState({
			always: [{
				actions: ['always'],
			}],
			actions: {
				always() {
					log.push('always');
				},
			},
			states: {
				s1: new AtomicState(),
			},
		}).start();
		expect(log).toEqual(['always']);
		machine.start();
		expect(log).toEqual(['always', 'always']);
	});
	it('is resets to initial state', () => {
		const machine = new CompoundState({
			states: {
				s1: new AtomicState({
					on: {
						event: [{ transitionTo: 's2' }],
					},
				}),
				s2: new AtomicState(),
			},
		}).start();
		expect(machine.state?.name).toEqual('s1');
		machine.dispatch('event');
		expect(machine.state?.name).toEqual('s2');
		machine.start();
		expect(machine.state?.name).toEqual('s1');
	});
});
