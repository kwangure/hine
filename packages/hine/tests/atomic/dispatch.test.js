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
		const s1 = new AtomicState({
			on: {
				event: [
					new TransitionHandler({
						goto: 's2',
					}),
				],
			},
		});
		const s2 = new AtomicState({
			on: {
				event: [
					new TransitionHandler({
						goto: 's1',
					}),
				],
			},
		});
		const compound = new CompoundState({
			states: { s1, s2 },
		});
		compound.monitor({});
		compound.start();
		compound.dispatch('event');
		expect(compound.state).toBe(s2);
		compound.dispatch('event');
		expect(compound.state).toBe(s1);
		compound.dispatch('event');
		expect(compound.state).toBe(s2);
	});

	it('ignores invalid events', () => {
		const machine = new AtomicState().start();
		expect(() => {
			machine.dispatch('random');
		}).not.toThrow();
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
		machine.dispatch(event);
	});
});
