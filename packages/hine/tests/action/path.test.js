import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { ActionRunner } from '../../src/runner/action.js';
import { EffectHandler } from '../../src/handler/effect.js';

describe('path', () => {
	it('returns path with name', () => {
		const state = new AtomicState({ name: 'state' });
		const action = new ActionRunner({
			name: 'action',
			run() {},
			ownerState: state,
		});
		expect(action.path).toEqual(['state', '(action)']);
	});
	it('returns path with empty string when missing name', () => {
		const state = new AtomicState({});
		const action = new ActionRunner({
			run() {},
			ownerState: state,
		});
		expect(action.path).toEqual(['', '()']);
	});
	it('includes ownerState path', () => {
		const state = new AtomicState({
			name: 'state',
			always: [new EffectHandler({ run: ['action'] })],
		});
		state.resolve({
			actions: {
				action: {
					name: 'action',
					run(action) {
						expect(action.path).toEqual(['state', '(action)']);
					},
				},
			},
		});
	});
});
