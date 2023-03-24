import { describe, expect, it } from 'vitest';
import { AtomicState } from 'src';

describe('matches', () => {
	it('does not match when unresolved', () => {
		const machine = new AtomicState({
			name: 'machine',
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('does not match when not started', () => {
		const machine = new AtomicState({
			name: 'machine',
		});
		expect(machine.matches('machine')).toBe(false);
	});
	it('matches state name when started', () => {
		const machine = new AtomicState({
			name: 'machine',
		}).start();
		expect(machine.matches('machine')).toBe(true);
	});
	it('matches anonymous states', () => {
		const machine = new AtomicState().start();
		expect(machine.matches('')).toBe(true);
	});
});
