import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('step', () => {
	it('call subscribers at the end', () => {
		const state = new AtomicState({
			always: {
				run: ['action'],
			},
			on: {
				event: {
					run: ['action'],
				},
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
	it('throws if state is not initialized', () => {
		const state = new AtomicState({
			always: {
				run: ['action'],
			},
		});
		const iterator = state.step('event');
		expect(() => iterator.next()).toThrow(/resolve\(\)/);
	});
	it('throws if step is already in progress', () => {
		const state = new AtomicState({
			always: {
				run: ['action'],
			},
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
		const state = new AtomicState({});
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
