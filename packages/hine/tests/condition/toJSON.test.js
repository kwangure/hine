import { describe, expect, it } from 'vitest';
import { ConditionRunner } from '../../src/runner/condition.js';
import { AtomicState } from '../../src/state/atomic.js';

describe('toJSON', () => {
	it('includes name', () => {
		const state = new AtomicState({});
		const name = 'action';
		const condition = new ConditionRunner({
			name,
			run: () => true,
			ownerState: state,
		});
		const json = condition.toJSON();
		expect(json.name).toBe(name);
	});
	it('default to empty string when missing name', () => {
		const state = new AtomicState({});
		const condition = new ConditionRunner({
			run: () => true,
			ownerState: state,
		});
		const json = condition.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const state = new AtomicState({});
		const condition = new ConditionRunner({
			run: () => true,
			ownerState: state,
		});
		const json = condition.toJSON();
		expect(json.type).toEqual('condition');
	});
	it('includes path', () => {
		const state = new AtomicState({ name: 'state' });
		const condition = new ConditionRunner({
			name: 'condition',
			run: () => true,
			ownerState: state,
		});
		const json = condition.toJSON();
		expect(json.path).toEqual(['state', '?condition']);
	});
});
