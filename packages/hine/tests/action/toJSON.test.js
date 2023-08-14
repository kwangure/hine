import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'action';
		const action = new Action({
			name,
			run() {},
		});
		const json = action.toJSON();
		expect(json.name).toBe(name);
	});
	it('default to empty string when missing name', () => {
		const action = new Action({
			run() {},
		});
		const json = action.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const action = new Action({
			run() {},
		});
		const json = action.toJSON();
		expect(json.type).toEqual('action');
	});
	it('includes path', () => {
		const action = new Action({
			name: 'action',
			run() {},
		});
		const json = action.toJSON();
		expect(json.path).toEqual(['(action)']);
	});
});
