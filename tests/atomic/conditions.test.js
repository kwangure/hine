import { describe, expect, it } from 'vitest';
import { AtomicState } from 'src';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const machine = new AtomicState({
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
		});
		machine.start();
	});
	it('calls condition in machine context', () => {
		const state = new AtomicState({
			conditions: {
				dummy() {
					expect(this).toBe(state);
					return true;
				},
			},
			actions: {
				action() {},
			},
			entry: [{
				condition: 'dummy',
				actions: ['action'],
			}],
		});
		state.start();
	});
});
