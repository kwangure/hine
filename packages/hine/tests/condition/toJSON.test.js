import { describe, expect, it } from 'vitest';
import { Condition } from '../../src/condition.js';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'action';
		const condition = new Condition({
			name,
			run: () => true,
		});
		const json = condition.toJSON();
		expect(json.name).toBe(name);
	});
	it('default to empty string when missing name', () => {
		const condition = new Condition({
			run: () => true,
		});
		const json = condition.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const condition = new Condition({
			run: () => true,
		});
		const json = condition.toJSON();
		expect(json.type).toEqual('condition');
	});
	it('includes path', () => {
		const condition = new Condition({
			name: 'condition',
			run: () => true,
		});
		const json = condition.toJSON();
		expect(json.path).toEqual(['?condition']);
	});
});
