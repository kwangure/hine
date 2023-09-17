import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { AtomicState } from '../../src/state/atomic.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('subscribe', () => {
	it('calls subscribers on start', () => {
		const machine = new AtomicState();
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.resolve();
		expect(count).toBe(2);
	});
	it('calls subscribers on disptach', () => {
		const state = new AtomicState({
			on: {
				event: [
					new EffectHandler({
						run: ['noop'],
					}),
				],
			},
		});
		state.resolve({
			actions: {
				noop: new ActionRunner({
					run() {},
				}),
			},
		});
		let count = 0;
		state.subscribe(() => count++);
		expect(count).toBe(1);

		state.dispatch('event');
		expect(count).toBe(2);

		state.dispatch('useless');
		expect(count).toBe(3);
	});
});
