import { AtomicState, CompoundState } from 'src';
import { describe, expect, it } from 'vitest';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'state';
		const state = new CompoundState({
			name,
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.name).toBe(name);
	});
	it('defaults to empty string when missing name', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.name).toBe('');
	});
	it('includes type', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.type).toEqual('compound');
	});
	it('serializes nested states', () => {
		const state = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		const json = state.toJSON();
		expect(json.states).toEqual({
			s1: {
				name: 's1',
				type: 'atomic',
			},
		});
	});
});
