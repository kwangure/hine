import { describe, expect, it } from 'vitest';
import { atomic } from '../atomic.js';
import { compound } from '../compound.js';
import { resolveState } from './resolve.js';
import { matches } from './matches.js';
import { parallel } from '../parallel.js';

describe('matches', () => {
	it('matches atomic state', () => {
		const stateConfig = atomic('s');
		const state = resolveState(stateConfig);

		expect(matches(state, 's')).toBe(true);
	});
	it('matches compound state', () => {
		const stateConfig = compound('s', {
			initial: 's1',
			children: [atomic('s1'), atomic('s2')],
		});
		const state = resolveState(stateConfig);

		expect(matches(state, 's')).toBe(true);
		expect(matches(state, 's.s1')).toBe(true);
		expect(matches(state, 's.s2')).toBe(false);
	});
	it('matches parallel state', () => {
		const stateConfig = parallel('s', {
			children: [atomic('s1'), atomic('s2')],
		});
		const state = resolveState(stateConfig);

		expect(matches(state, 's')).toBe(true);
		expect(matches(state, 's.s1')).toBe(true);
		expect(matches(state, 's.s2')).toBe(true);
	});
});
