import { describe, expect, it } from 'vitest';
import { AtomicState } from 'src';

describe('subscribe', () => {
	it('doesn\'t call subscribers on configure', () => {
		const machine = new AtomicState();
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.configure({
			actions: {},
			always: [],
			entry: [],
		});
		expect(count).toBe(1);
	});
	it('doesn\'t call subscribers on resolve', () => {
		const machine = new AtomicState({
			actions: {},
			always: [],
			entry: [],
		});
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.resolve();
		expect(count).toBe(1);
	});
	it('calls subscribers on start', () => {
		const machine = new AtomicState({
			actions: {},
			always: [],
			entry: [],
		}).resolve();
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.start();
		expect(count).toBe(2);
	});
	it('calls subscribers on disptach', () => {
		const machine = new AtomicState({
			actions: {
				noop() {},
			},
			on: {
				event: [{
					actions: ['noop'],
				}],
			},
		})
			.resolve()
			.start();
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.dispatch('event');
		expect(count).toBe(2);

		machine.dispatch('useless');
		expect(count).toBe(3);
	});
});
