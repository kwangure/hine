import { Action, AtomicState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('subscribe', () => {
	it('calls subscribers on start', () => {
		const machine = new AtomicState({
			actions: {},
			always: [],
			entry: [],
		});
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.start();
		expect(count).toBe(2);
	});
	it('calls subscribers on disptach', () => {
		const machine = new AtomicState({
			actions: {
				noop: new Action({
					run() {},
				}),
			},
			on: {
				event: [{
					actions: ['noop'],
				}],
			},
		}).start();
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.dispatch('event');
		expect(count).toBe(2);

		machine.dispatch('useless');
		expect(count).toBe(3);
	});
});
