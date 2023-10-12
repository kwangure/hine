import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';

describe('activeEvents', () => {
	it('returns handlable events', () => {
		const state = new CompoundState({
			on: {
				EVENT1: {
					run: ['action'],
				},
			},
			children: {
				s1: new CompoundState({
					on: {
						EVENT2: {
							run: ['action'],
						},
					},
					children: {
						s11: new AtomicState({}),
					},
				}),
			},
		});
		state.resolve({
			actions: {
				action() {},
			},
		});
		expect(state.activeEvents).toEqual(['EVENT1', 'EVENT2']);
	});
	it('returns unique handlable events', () => {
		const state = new CompoundState({
			on: {
				EVENT: {
					run: ['action'],
				},
			},
			children: {
				s1: new AtomicState({
					on: {
						EVENT: {
							run: ['action'],
						},
					},
				}),
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
		const state = new CompoundState({
			on: {
				EVENT: {
					run: ['action'],
				},
			},
			children: {
				s1: new AtomicState({}),
			},
		});
		expect(state.activeEvents).toEqual([]);
	});
	it('returns no events when handler list is empty', () => {
		const state = new CompoundState({
			on: {
				EVENT: [],
			},
			children: {
				s1: new AtomicState({}),
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
