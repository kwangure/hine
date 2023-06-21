import { Action, AtomicState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('path', () => {
	it('returns path with name', () => {
		const action = new Action({
			name: 'action',
			run() {},
		});
		expect(action.path).toEqual(['(action)']);
	});
	it('returns path with empty string when missing name', () => {
		const action = new Action({
			run() {},
		});
		expect(action.path).toEqual(['()']);
	});
	it('includes ownerState path', () => {
		const action = new Action({
			name: 'action',
			run() {},
		});
		const state = new AtomicState({ name: 'state' });
		state.monitor({ actions: { action }});
		state.start();
		expect(action.path).toEqual(['state', '(action)']);
	});
});
