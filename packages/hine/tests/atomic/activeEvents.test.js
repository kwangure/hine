import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('activeEvents', () => {
	it('returns handlable events', () => {
		const state = new AtomicState({
			on: {
				EVENT: {
					run: ['action'],
				},
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
				EVENT: {
					run: ['action'],
				},
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
