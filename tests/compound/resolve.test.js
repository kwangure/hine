import { AtomicState, CompoundState } from 'src';
import { describe, expect, it } from 'vitest';

describe('resolve', () => {
	it('returns a reference to the machine', () => {
		const machine = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		expect(machine.resolve()).toBe(machine);
	});
});
