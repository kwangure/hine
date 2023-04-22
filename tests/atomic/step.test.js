import { Action, AtomicState, Condition } from 'src';
import { describe, expect, it } from 'vitest';
import { Handler } from '../../src/handler.js';
import { zip } from 'src/utils/iterator';

describe('step', () => {
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
		// consume the iterator yield values
		// eslint-disable-next-line no-unused-vars
		for (const _item of eventIterator) {
			expect(count).toBe(1);
		}

		// consume the iterator return value
		eventIterator.next();
		expect(count).toBe(2);
	});
	it('respects iterator protocol', () => {
		const action = new Action({
			run() {},
		});
		const condition = new Condition({
			run: () => true,
		});
		const state = new AtomicState({
			always: [{
				actions: ['action'],
			}],
			actions: { action },
			conditions: { condition },
			on: {
				event: [{
					condition: 'condition',
					actions: ['action'],
				}],
			},
		}).start();

		const expected = [Handler, condition, action, Handler, action];
		const expectedIterator = expected[Symbol.iterator]();
		const eventIterator = state.step('event');
		for (const [expected, actual] of zip(expectedIterator, eventIterator)) {
			switch (typeof expected) {
				case 'object':
					expect(actual).toBe(expected);
					break;
				case 'function':
					expect(actual).toBeInstanceOf(expected);
					break;
				default:
					throw Error('Not implemented.');
			}
		}
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
