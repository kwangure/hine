import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';

describe('activeEvents', () => {
	it('returns handlable events', () => {
		const state = new CompoundState({
			on: {
				EVENT1: [
					{
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState({
					on: {
						EVENT2: [
							{
								actions: ['action'],
							},
						],
					},
				}),
			},
		});
		state.monitor({
			actions: {
				action: new Action({ run() {} }),
			},
		});
		state.start();
		expect(state.activeEvents).toEqual(['EVENT1', 'EVENT2']);
	});
	it('returns unique handlable events', () => {
		const state = new CompoundState({
			on: {
				EVENT: [
					{
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState({
					on: {
						EVENT: [
							{
								actions: ['action'],
							},
						],
					},
				}),
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
		const state = new CompoundState({
			on: {
				EVENT: [
					{
						actions: ['action'],
					},
				],
			},
			states: {
				s1: new AtomicState(),
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
		const state = new CompoundState({
			on: {
				EVENT: [],
			},
			states: {
				s1: new AtomicState(),
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
