import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('dispatch', () => {
	it('throws on unresolved dispatch', () => {
		const machine = new AtomicState({});
		// @ts-expect-error
		expect(() => machine.dispatch('test')).toThrow(
			'Attempted dispatch before resolving state',
		);
	});

	it('transitions on dispatch', () => {
		const compound = new CompoundState({
			children: {
				s1: new AtomicState({
					on: {
						event: {
							goto: 's2',
						},
					},
				}),
				s2: new AtomicState({
					on: {
						event: {
							goto: 's1',
						},
					},
				}),
			},
		});
		compound.resolve();
		compound.dispatch('event');
		expect(compound.matches('.s2')).toBe(true);
		compound.dispatch('event');
		expect(compound.matches('.s1')).toBe(true);
		compound.dispatch('event');
		expect(compound.matches('.s2')).toBe(true);
	});

	it('ignores invalid events', () => {
		const state = new AtomicState({});
		state.resolve();
		expect(() => {
			// @ts-expect-error
			state.dispatch('random');
		}).not.toThrow();
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
		// @ts-expect-error
		state.dispatch(event);
	});
});
