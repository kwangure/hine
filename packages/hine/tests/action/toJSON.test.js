import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'action';
		const action = new ActionRunner({
			name,
			run() {},
		});
		const json = action.toJSON();
		expect(json.name).toBe(name);
	});
	it('default to empty string when missing name', () => {
		const action = new ActionRunner({
			run() {},
		});
		const json = action.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const action = new ActionRunner({
			run() {},
		});
		const json = action.toJSON();
		expect(json.type).toEqual('action');
	});
	it('includes path', () => {
		const action = new ActionRunner({
			name: 'action',
			run() {},
		});
		const json = action.toJSON();
		expect(json.path).toEqual(['(action)']);
	});
});
