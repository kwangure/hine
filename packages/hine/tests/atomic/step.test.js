import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { ConditionRunner } from '../../src/runner/condition.js';
import { EffectHandler } from '../../src/handler/effect.js';
import { zip } from '../../src/utils/iterator.js';

describe('step', () => {
	it('call subscribers at the end', () => {
		const state = new AtomicState({
			always: [
				new EffectHandler({
					run: ['action'],
				}),
			],
			on: {
				event: [
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});
		state.resolve({
			actions: {
				action() {},
			},
		});

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
		const state = new AtomicState({
			always: [
				new EffectHandler({
					run: ['action'],
				}),
			],
			on: {
				event: [
					new EffectHandler({
						if: 'condition',
						run: ['action'],
					}),
				],
			},
		});
		state.resolve({
			actions: { action() {} },
			conditions: { condition: () => true },
		});

		const expected = [
			EffectHandler,
			ConditionRunner,
			ActionRunner,
			EffectHandler,
			ActionRunner,
		];
		const expectedIterator = expected[Symbol.iterator]();
		const eventIterator = state.step('event');
		for (const [expected, actual] of zip(expectedIterator, eventIterator)) {
			expect(actual).toBeInstanceOf(expected);
		}
	});
	it('throws if state is not initialized', () => {
		const state = new AtomicState({
			always: [
				new EffectHandler({
					run: ['action'],
				}),
			],
		});
		const iterator = state.step('event');
		expect(() => iterator.next()).toThrow(/resolve\(\)/);
	});
	it('throws if step is already in progress', () => {
		const state = new AtomicState({
			always: [
				new EffectHandler({
					run: ['action'],
				}),
			],
		});
		state.resolve({
			actions: {
				action() {},
			},
		});
		state.step('event').next();
		expect(() => state.step('event').next()).toThrow(/in progress/);
	});
	it('displays emitted event', () => {
		const state = new AtomicState();
		state.resolve();
		const event = 'my-event';
		let initial = true;
		state.subscribe((machine) => {
			if (initial) {
				initial = false;
				return;
			}
			expect(machine.event?.name).toBe(event);
		});
		state.step(event).next();
	});
});
