import { describe, expect, it } from 'vitest';
import { Condition } from '../../src';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'action';
		const action = new Condition({
			name,
			run: () => true,
		});
		const json = action.toJSON();
		expect(json.name).toBe(name);
	});
	it('default to empty string when missing name', () => {
		const action = new Condition({
			run: () => true,
		});
		const json = action.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const action = new Condition({
			run: () => true,
		});
		const json = action.toJSON();
		expect(json.type).toEqual('condition');
	});
});
