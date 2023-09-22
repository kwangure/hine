import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'state';
		const state = new AtomicState({ name });
		const json = state.toJSON();
		expect(json.name).toBe(name);
	});
	it('default to empty string when missing name', () => {
		const state = new AtomicState({});
		const json = state.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const state = new AtomicState({});
		const json = state.toJSON();
		expect(json.type).toEqual('atomic');
	});
	it('includes path', () => {
		const state = new AtomicState({
			name: 'state',
		});
		const json = state.toJSON();
		expect(json.path).toEqual(['state']);
	});
});
