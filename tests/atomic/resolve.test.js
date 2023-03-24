import { describe, expect, it } from 'vitest';
import { AtomicState } from 'src';

describe('resolve', () => {
	it('returns a reference to the machine', () => {
		const machine = new AtomicState();
		expect(machine.resolve()).toBe(machine);
	});
});
