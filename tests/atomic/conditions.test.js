import { Action, AtomicState, Condition } from 'src';
import { describe, expect, it } from 'vitest';

describe('conditions', () => {
	it('exposes conditions inside conditions', () => {
		const machine = new AtomicState({
			entry: [{
				condition: 'cond1',
				actions: ['do'],
			}],
			actions: {
				do: new Action({
					run() {},
				}),
			},
			conditions: {
				cond1: new Condition({
					run() {
						expect(this).toBe(machine);
						expect(() => this.conditions.cond2).not.toThrow();
						expect(this.conditions.cond2.run()).toBe(false);
						return true;

					},
				}),
				cond2: new Condition({
					run() {
						expect(this).toBe(machine);
						return false;
					},
				}),
			},
		});
		machine.start();
	});
	it('calls condition in machine context', () => {
		const state = new AtomicState({
			conditions: {
				dummy: new Condition({
					run() {
						expect(this).toBe(state);
						return true;
					},
				}),
			},
			actions: {
				action: new Action({
					run() {},
				}),
			},
			entry: [{
				condition: 'dummy',
				actions: ['action'],
			}],
		});
		state.start();
	});
});
