import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';

describe('toJSON', () => {
	it('includes name', () => {
		const state = new AtomicState();
		const name = 'action';
		const action = new ActionRunner({
			name,
			run() {},
			ownerState: state,
		});
		const json = action.toJSON();
		expect(json.name).toBe(name);
	});
	it('default to empty string when missing name', () => {
		const state = new AtomicState();
		const action = new ActionRunner({
			run() {},
			ownerState: state,
		});
		const json = action.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const state = new AtomicState();
		const action = new ActionRunner({
			run() {},
			ownerState: state,
		});
		const json = action.toJSON();
		expect(json.type).toEqual('action');
	});
	it('includes path', () => {
		const state = new AtomicState({ name: 'state' });
		const action = new ActionRunner({
			name: 'action',
			run() {},
			ownerState: state,
		});
		const json = action.toJSON();
		expect(json.path).toEqual(['state', '(action)']);
	});
});
