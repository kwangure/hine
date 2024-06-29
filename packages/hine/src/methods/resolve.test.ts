import { describe, expect, it } from 'vitest';
import { atomic } from '../states/atomic.js';
import { compound } from '../states/compound.js';
import { parallel } from '../states/parallel.js';
import { emitEvent } from './emit.js';
import { resolveState } from './resolve.js';
import type { StateNode } from '../states/types.js';

describe('resolveState', () => {
	it('runs entry hook on atomic state', () => {
		const events: string[] = [];
		const stateConfig = atomic('s', {
			hooks: {
				afterEntry: () => events.push('s'),
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s']);
	});

	it('runs entry hook on active children in compound state', () => {
		const events: string[] = [];
		const stateConfig = compound('s', {
			initial: 's1',
			hooks: {
				afterEntry: () => events.push('s'),
			},
			children: [
				atomic('s1', {
					hooks: {
						afterEntry: () => events.push('s1'),
					},
				}),
				atomic('s2', {
					hooks: {
						afterEntry: () => events.push('s2'),
					},
				}),
			],
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s', 's1']);
	});

	it('run entry hooks on all children in parallel state', () => {
		const events: string[] = [];
		const stateConfig = parallel('s', {
			hooks: {
				afterEntry: () => events.push('s'),
			},
			children: [
				atomic('s1', {
					hooks: {
						afterEntry: () => events.push('s1'),
					},
				}),
				atomic('s2', {
					hooks: {
						afterEntry: () => events.push('s2'),
					},
				}),
			],
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(events).toStrictEqual(['s', 's1', 's2']);
	});

	it('handles conditional entry hook when condition is met', () => {
		let conditionMet = false;
		const stateConfig = atomic('s', {
			hooks: {
				afterEntry: {
					if: () => true,
					run: () => (conditionMet = true),
				},
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(conditionMet).toBe(true);
	});

	it('ignores conditional entry hook when condition is not met', () => {
		let conditionMet = false;
		const stateConfig = atomic('s', {
			hooks: {
				afterEntry: {
					if: () => false,
					run: () => (conditionMet = true),
				},
			},
		});
		const state = resolveState(stateConfig);

		emitEvent(state, 'event');
		expect(conditionMet).toBe(false);
	});

	it('sets currentTarget and target correctly in entry hook of nested state trees', () => {
		const targets: StateNode[] = [];
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				atomic('s1', {
					hooks: {
						afterEntry(event) {
							targets.push(event.currentTarget);
							targets.push(event.target);
						},
					},
				}),
			],
			hooks: {
				afterEntry(event) {
					targets.push(event.currentTarget);
					targets.push(event.target);
				},
			},
		});
		const state = resolveState(stateConfig);
		emitEvent(state, 'event');

		const [currentTarget1, target1, currentTarget2, target2] = targets.map(
			(t) => t.name,
		);

		expect(currentTarget1).toBe('s');
		expect(target1).toBe('s');
		expect(currentTarget2).toBe('s1');
		expect(target2).toBe('s');
	});
});
