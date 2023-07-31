import { Action, AtomicState } from '../../src';
import { describe, expect, it } from 'vitest';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('start', () => {
	it('is resolves config idempotently', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			always: [
				new EffectHandler2({
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
