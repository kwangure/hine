import { AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('dispatch', () => {
	it('throws on unresolved dispatch', () => {
		const machine = new AtomicState();
		expect(() => machine.dispatch('test')).toThrow(
			'Attempted dispatch before resolving state',
		);
	});

	it('transitions on dispatch', () => {
		const compound = new CompoundState({
			children: {
				s1: new AtomicState({
					on: {
						event: [
							new TransitionHandler({
								goto: 's2',
							}),
						],
					},
				}),
				s2: new AtomicState({
					on: {
						event: [
							new TransitionHandler({
								goto: 's1',
							}),
						],
					},
				}),
			},
		});
		compound.monitor({});
		compound.start();
		compound.dispatch('event');
		expect(compound.matches('.s2')).toBe(true);
		compound.dispatch('event');
		expect(compound.matches('.s1')).toBe(true);
		compound.dispatch('event');
		expect(compound.matches('.s2')).toBe(true);
	});

	it('ignores invalid events', () => {
		const state = new AtomicState();
		state.start();
		expect(() => {
			state.dispatch('random');
		}).not.toThrow();
	});
	it('displays emitted event', () => {
		const state = new AtomicState();
		state.start();
		expect(state.event).toBe(null);
		const event = 'my-event';
		let initial = true;
		state.subscribe((machine) => {
			if (initial) {
				initial = false;
				return;
			}
			expect(machine.event?.name).toBe(event);
		});
		state.dispatch(event);
	});
});
