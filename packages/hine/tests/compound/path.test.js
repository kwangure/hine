import { AtomicState, CompoundState } from '../../src';
import { describe, expect, it } from 'vitest';

describe('path', () => {
	it('matches state name when started', () => {
		const state = new CompoundState({
			name: 'state',
			states: {
				s1: new AtomicState(),
			},
		});
		expect(state.path).toEqual(['state']);
	});
	it('creates path for nested states', () => {
		const s2 = new CompoundState({
			states: {
				s21: new AtomicState(),
			},
		});
		const s11 = new AtomicState();
		const state = new CompoundState({
			name: 'state',
			states: {
				s1: new CompoundState({
					states: {
						s11,
					},
				}),
				s2,
			},
		}).start();
		expect(state.path).toEqual(['state']);
		expect(s11.path).toEqual(['state', 's1', 's11']);
		expect(s2.path).toEqual(['state', 's2']);
	});
	it('creates path for anonymous states', () => {
		const s2 = new CompoundState({
			states: {
				s21: new AtomicState(),
			},
		});
		const s11 = new AtomicState();
		const state = new CompoundState({
			states: {
				s1: new CompoundState({
					states: {
						s11,
					},
				}),
				s2,
			},
		}).start();
		expect(state.path).toEqual(['']);
		expect(s11.path).toEqual(['', 's1', 's11']);
		expect(s2.path).toEqual(['', 's2']);
	});
});
