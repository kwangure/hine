import { describe, expect, it } from 'vitest';
import { atomic } from '../atomic.js';
import { compound } from '../compound.js';
import { parallel } from '../parallel.js';
import { emitEvent } from './emit.js';
import { resolveState } from './resolve.js';
import type { StateNode } from '../types.js';

describe('emitEvent', () => {
	it('emits event to atomic state', () => {
		const events: string[] = [];
		const stateConfig = atomic('s', {
			on: {
				event: () => events.push('s'),
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s']);
	});

	it('emits event to active child in compound state', () => {
		const events: string[] = [];
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				atomic('s1', {
					on: {
						event: () => events.push('s1'),
					},
				}),
				atomic('s2', {
					on: {
						event: () => events.push('s2'),
					},
				}),
			],
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s1']);
	});

	it('emits event to all children in parallel state', () => {
		const events: string[] = [];
		const stateConfig = parallel('s', {
			children: [
				atomic('s1', {
					on: {
						event: () => events.push('s1'),
					},
				}),
				atomic('s2', {
					on: {
						event: () => events.push('s2'),
					},
				}),
			],
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s1', 's2']);
	});

	it('ignores event without listener in atomic state', () => {
		const stateConfig = atomic('s', {});
		const state = resolveState(stateConfig);
		let noErrorThrown = true;

		try {
			emitEvent(state, 'event');
		} catch (e) {
			noErrorThrown = false;
		}

		expect(noErrorThrown).toBe(true);
	});

	it('handles conditional event when condition is met', () => {
		let conditionMet = false;
		const stateConfig = atomic('s', {
			on: {
				event: {
					if: () => true,
					run: () => (conditionMet = true),
				},
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(conditionMet).toBe(true);
	});

	it('ignores conditional event when condition is not met', () => {
		let conditionMet = false;
		const stateConfig = atomic('s', {
			on: {
				event: {
					if: () => false,
					run: () => (conditionMet = true),
				},
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(conditionMet).toBe(false);
	});

	it('handles emitting deeply nested state event', () => {
		const events: string[] = [];
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				compound('s1', {
					initial: 's11',
					children: [
						atomic('s11', {
							on: {
								event: () => events.push('s11'),
							},
						}),
					],
					on: {
						event: () => events.push('s1'),
					},
				}),
				atomic('s2', {
					on: {
						event: () => events.push('s2'),
					},
				}),
			],
			on: {
				event: () => events.push('s'),
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s11', 's1', 's']);
	});

	it('executes listeners for a single event in order', () => {
		const listenerOrder: string[] = [];

		const stateConfig = atomic('s', {
			on: {
				event: [
					{ run: () => listenerOrder.push('L1') },
					{ run: () => listenerOrder.push('L2') },
					{ run: () => listenerOrder.push('L3') },
				],
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');

		expect(
			listenerOrder,
			'Listeners should be executed in the order they were added',
		).toStrictEqual(['L1', 'L2', 'L3']);
	});

	it('passes event type and detail to listeners', () => {
		let detail = null;
		let type = '';

		const stateConfig = atomic('state', {
			on: {
				event(event) {
					({ detail, type } = event);
				},
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event', 'detail');

		expect(
			type,
			'The correct event type should be received by the listener',
		).toBe('event');
		expect(
			detail,
			'The correct event detail should be received by the listener',
		).toBe('detail');
	});

	it('sets currentTarget and target correctly in nested state trees', () => {
		const targets: StateNode[] = [];
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				atomic('s1', {
					on: {
						event(event) {
							targets.push(event.currentTarget);
							targets.push(event.target);
						},
					},
				}),
			],
			on: {
				event(event) {
					targets.push(event.currentTarget);
					targets.push(event.target);
				},
			},
		});
		const state = resolveState(stateConfig);
		emitEvent(state, 'event');

		const [currentTarget1, target1, currentTarget2, target2] = targets;
		expect(
			(currentTarget1 as StateNode)?.name,
			'currentTarget should the state on which this listener is attached to',
		).toBe('s1');
		expect(
			target1,
			'target should be the original state where the event was emitted',
		).toBe(state);
		expect(
			currentTarget2,
			'currentTarget should the state on which this listener is attached to',
		).toBe(state);
		expect(
			target2,
			'target should be the original state where the event was emitted',
		).toBe(state);
	});

	it('transitions state in compound state', () => {
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				atomic('s1', { on: { event: { goto: 's2' } } }),
				atomic('s2'),
			],
		});
		const state = resolveState(stateConfig);

		expect(state.activeStates[0][0]).toBe('s1');
		emitEvent(state, 'event');
		expect(state.activeStates[0][0]).toBe('s2');
	});

	it('throws error on transition to non-existent state', () => {
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				atomic('s1', { on: { event: { goto: 'nonexistent' } } }),
				atomic('s2'),
			],
		});
		const state = resolveState(stateConfig);

		expect(() => emitEvent(state, 'event')).toThrow();
	});

	it('throws error on transition in state without parent', () => {
		const stateConfig = atomic('s', { on: { event: { goto: 's2' } } });
		const state = resolveState(stateConfig);

		expect(() => emitEvent(state, 'event')).toThrow();
	});

	it('stops executing listeners on transition', () => {
		const events: string[] = [];
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				atomic('s1', {
					on: {
						event: [
							{ run: () => events.push('e1') },
							{ run: () => events.push('e2'), goto: 's2' },
							{ run: () => events.push('e3') },
						],
					},
				}),
				atomic('s2'),
			],
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['e1', 'e2']);
	});

	it('runs entry hook after transition', () => {
		const events: string[] = [];
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				atomic('s1', {
					on: {
						event: { goto: 's2' },
					},
				}),
				compound('s2', {
					initial: 's21',
					hooks: {
						afterEntry: () => events.push('s2'),
					},
					children: [
						atomic('s21', {
							hooks: {
								afterEntry: () => events.push('s21'),
							},
						}),
					],
				}),
			],
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s2', 's21']);
	});

	it.only('runs exit hooks before transition', () => {
		const events: string[] = [];
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				compound('s1', {
					initial: 's11',
					hooks: {
						beforeExit: () => events.push('s1'),
					},
					children: [
						atomic('s11', {
							hooks: {
								beforeExit: () => events.push('s11'),
							},
						}),
					],
					on: {
						event: { goto: 's2' },
					},
				}),
				atomic('s2'),
			],
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s11', 's1']);
	});
});
