import { AtomicState, CompoundState } from 'src';
import { describe, expect, it } from 'vitest';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const machine = new CompoundState({
			entry: [{
				condition: 'cond1',
				actions: ['do'],
			}],
			actions: {
				do() {},
			},
			conditions: {
				cond1() {
					expect(this).toBe(machine);
					expect(() => this.conditions.cond2).not.toThrow();
					expect(this.conditions.cond2()).toBe(false);
					return true;
				},
				cond2() {
					expect(this).toBe(machine);
					return false;
				},
			},
			states: {
				s1: new AtomicState(),
			},
		});
		machine.start();
	});
});
