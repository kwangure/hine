import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('start', () => {
	it('is resolves config idempotently', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			always: [
				new EffectHandler({
					run: ['always'],
				}),
			],
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
	it('emits start event', () => {
		const machine = new AtomicState();
		expect(machine.event).toBe(null);
		let initial = true;
		machine.subscribe((machine) => {
			if (initial) {
				initial = false;
				return;
			}
			expect(machine.event?.name).toBe('_start');
		});
		machine.start();
	});
});
