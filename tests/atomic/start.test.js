import { describe, expect, it } from 'vitest';
import { AtomicState } from 'src';

describe('start', () => {
	it('is resolves config idempotently', () => {
		/** @type {string[]} */
		const log = [];
		const machine = new AtomicState({
			always: [{
				actions: ['always'],
			}],
			actions: {
				always() {
					log.push('always');
				},
			},
		}).start();
		expect(log).toEqual(['always']);
		machine.start();
		expect(log).toEqual(['always', 'always']);
	});
});
