import { describe, expect, it } from 'vitest';
import { ConditionRunner } from '../../src/runner/condition.js';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'action';
		const condition = new ConditionRunner({
			name,
			run: () => true,
		});
		const json = condition.toJSON();
		expect(json.name).toBe(name);
	});
	it('default to empty string when missing name', () => {
		const condition = new ConditionRunner({
			run: () => true,
		});
		const json = condition.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const condition = new ConditionRunner({
			run: () => true,
		});
		const json = condition.toJSON();
		expect(json.type).toEqual('condition');
	});
	it('includes path', () => {
		const condition = new ConditionRunner({
			name: 'condition',
			run: () => true,
		});
		const json = condition.toJSON();
		expect(json.path).toEqual(['?condition']);
	});
});
