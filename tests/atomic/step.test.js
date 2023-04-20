import { Action, AtomicState } from 'src';
import { describe, expect, it } from 'vitest';

describe('step', () => {
	it('steps through dispatched function', () => {
		const state = new AtomicState({
			always: [{
				actions: ['action'],
			}],
			actions: {
				action: new Action({
					run() {},
				}),
			},
			on: {
				event: [{
					actions: ['action'],
				}],
			},
		}).start();

		const eventIterator = state.step('event');
		let value;
		let done;
		({ value, done } = eventIterator.next());
		expect(value).toBe(state);
		expect(done).toBe(false);

		({ value, done } = eventIterator.next());
		expect(value).toBe(state);
		expect(done).toBe(false);

		({ value, done } = eventIterator.next());
		expect(value).toBe(undefined);
		expect(done).toBe(true);
	});
	it('call subscribers at the end', () => {
		const state = new AtomicState({
			always: [{
				actions: ['action'],
			}],
			actions: {
				action: new Action({
					run() {},
				}),
			},
			on: {
				event: [{
					actions: ['action'],
				}],
			},
		}).start();

		let count = 0;
		state.subscribe(() => count++);
		expect(count).toBe(1);

		const eventIterator = state.step('event');
		eventIterator.next();
		expect(count).toBe(1);

		eventIterator.next();
		expect(count).toBe(1);

		eventIterator.next();
		expect(count).toBe(2);
	});
	it('respects iterator protocol', () => {
		const state = new AtomicState({
			always: [{
				actions: ['action'],
			}],
			actions: {
				action: new Action({
					run() {},
				}),
			},
			on: {
				event: [{
					actions: ['action'],
				}],
			},
		}).start();

		const eventIterator = state.step('event');
		let count = 0;
		for (const value of eventIterator) {
			expect(value).toBe(state);
			count++;
		}
		expect(count).toBe(2);
	});
	it('throws if state is not initialized', () => {
		const state = new AtomicState({
			always: [{
				actions: ['action'],
			}],
			actions: {
				action: new Action({
					run() {},
				}),
			},
		});
		const iterator = state.step('event');
		expect(() => iterator.next()).toThrow(/start\(\)/);
	});
	it('throws if step is already in progress', () => {
		const state = new AtomicState({
			always: [{
				actions: ['action'],
			}],
			actions: {
				action: new Action({
					run() {},
				}),
			},
		}).start();
		state.step('event').next();
		expect(() => state.step('event').next()).toThrow(/in progress/);
	});
});
