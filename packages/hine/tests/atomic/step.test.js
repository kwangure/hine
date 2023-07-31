import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { Condition } from '../../src/condition.js';
import { EffectHandler2 } from '../../src/handler/effect.js';
import { zip } from '../../src/utils/iterator.js';

describe('step', () => {
	it('call subscribers at the end', () => {
		const state = new AtomicState({
			always: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
			on: {
				event: [
					new EffectHandler2({
						run: ['action'],
					}),
				],
			},
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {},
				}),
			},
		});
		state.start();

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
			always: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
			on: {
				event: [
					new EffectHandler2({
						if: 'condition',
						run: ['action'],
					}),
				],
			},
		});
		state.monitor({
			actions: { action },
			conditions: { condition },
		});
		state.start();

		const expected = [
			EffectHandler2,
			condition,
			action,
			EffectHandler2,
			action,
		];
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
			always: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
		});
		state.monitor({
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
			always: [
				new EffectHandler2({
					run: ['action'],
				}),
			],
		});
		state.monitor({
			actions: {
				action: new Action({
					run() {},
				}),
			},
		});
		state.start();
		state.step('event').next();
		expect(() => state.step('event').next()).toThrow(/in progress/);
	});
	it('displays emitted event', () => {
		const machine = new AtomicState().start();
		expect(machine.event).toBe(null);
		const event = 'my-event';
		let initial = true;
		machine.subscribe((machine) => {
			if (initial) {
				initial = false;
				return;
			}
			expect(machine.event?.name).toBe(event);
		});
		machine.step(event).next();
	});
});
