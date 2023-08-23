import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
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
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
		expect(state.activeEvents).toEqual([]);
	});
});
