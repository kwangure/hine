import { describe, expect, it } from 'vitest';
import { Action } from '../../src/action.js';
import { AtomicState } from '../../src/atomic.js';
import { EffectHandler2 } from '../../src/handler/effect.js';

describe('subscribe', () => {
	it('calls subscribers on start', () => {
		const machine = new AtomicState();
		let count = 0;
		machine.subscribe(() => count++);
		expect(count).toBe(1);

		machine.start();
		expect(count).toBe(2);
	});
	it('calls subscribers on disptach', () => {
		const state = new AtomicState({
			on: {
				event: [
					new EffectHandler2({
						run: ['noop'],
					}),
				],
			},
		});
		state.monitor({
			actions: {
				noop: new Action({
					run() {},
				}),
			},
		});
		state.start();
		let count = 0;
		state.subscribe(() => count++);
		expect(count).toBe(1);

		state.dispatch('event');
		expect(count).toBe(2);

		state.dispatch('useless');
		expect(count).toBe(3);
	});
});
