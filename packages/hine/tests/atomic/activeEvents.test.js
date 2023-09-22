import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('activeEvents', () => {
	it('returns handlable events', () => {
		const state = new AtomicState({
			on: {
				EVENT: [
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
		expect(state.activeEvents).toEqual(['EVENT']);
	});
	it('returns no events when not initialized', () => {
		const state = new AtomicState({
			on: {
				EVENT: [
					new EffectHandler({
						run: ['action'],
					}),
				],
			},
		});
		expect(state.activeEvents).toEqual([]);
	});
	it('returns no events when handler list is empty', () => {
		const state = new AtomicState({
			on: {
				EVENT: [],
			},
		});
		state.resolve({
			actions: {
				action() {},
			},
		});
		expect(state.activeEvents).toEqual([]);
	});
});
