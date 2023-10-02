import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('start', () => {
	it('is resolves config idempotently', () => {
		/** @type {string[]} */
		const log = [];
		const state = new AtomicState({
			always: {
				run: ['always'],
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
	it('emits start event', () => {
		const machine = new AtomicState({});
		let initial = true;
		machine.subscribe((machine) => {
			if (initial) {
				initial = false;
				return;
			}
			expect(machine.event?.name).toBe('_start');
		});
		machine.resolve();
	});
});
