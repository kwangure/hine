import { Action, AtomicState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('start', () => {
	it('is resolves config idempotently', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new AtomicState({
			always: [{
				actions: ['always'],
			}],
			actions: {
				always: new Action({
					run() {
						log.push('always');
					},
				}),
			},
		}).start();
		expect(log).toEqual(['always']);
		machine.start();
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
