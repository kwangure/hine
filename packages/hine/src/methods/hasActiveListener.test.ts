import { describe, expect, it } from 'vitest';
import { atomic } from '../states/atomic.js';
import { compound } from '../states/compound.js';
import { resolveState } from './resolve.js';
import { parallel } from '../states/parallel.js';
import { hasActiveListener } from './hasActiveListener.js';

describe('hasActiveListener', () => {
	it('checks atomic state', () => {
		const stateConfig = atomic('s', {
			on: { e: () => 'foo' },
		});
		const state = resolveState(stateConfig);

		expect(hasActiveListener(state, 'e')).toBe(true);
		expect(hasActiveListener(state, 'non-existent')).toBe(false);
	});
	it('checks compound state', () => {
		const stateConfig = compound('s', {
			initial: 's1',
			children: [
				atomic('s1', {
					on: { e1: () => 'foo' },
				}),
				atomic('s2', {
					on: { e2: () => 'foo' },
				}),
			],
			on: { e: () => 'foo' },
		});
		const state = resolveState(stateConfig);

		expect(hasActiveListener(state, 'e')).toBe(true);
		expect(hasActiveListener(state, 'e1')).toBe(true);
		expect(hasActiveListener(state, 'e2')).toBe(false);
	});
	it('checks parallel state', () => {
		const stateConfig = parallel('s', {
			children: [
				atomic('s1', {
					on: { e1: () => 'foo' },
				}),
				atomic('s2', {
					on: { e2: () => 'foo' },
				}),
			],
			on: { e: () => 'foo' },
		});
		const state = resolveState(stateConfig);

		expect(hasActiveListener(state, 'e')).toBe(true);
		expect(hasActiveListener(state, 'e1')).toBe(true);
		expect(hasActiveListener(state, 'e2')).toBe(true);
	});
});
