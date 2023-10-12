import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';

describe('matches', () => {
	it('does not match when not started', () => {
		const machine = new AtomicState({
			name: 'machine',
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('matches state name when started', () => {
		const state = new AtomicState({
			name: 'machine',
		});
		state.resolve();
		expect(state.matches('machine')).toBe(true);
	});
	it('matches anonymous states', () => {
		const state = new AtomicState({});
		state.resolve();
		expect(state.matches('')).toBe(true);
	});
});
