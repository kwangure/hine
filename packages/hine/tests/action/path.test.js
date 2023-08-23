import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { Action } from '../../src/action.js';

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
		state.monitor({ actions: { action } });
		state.start();
		expect(action.path).toEqual(['state', '(action)']);
	});
});
