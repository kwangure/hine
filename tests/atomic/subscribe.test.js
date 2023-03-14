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
		});
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.resolve().start();
		expect(count).toBe(2);
	});
});
