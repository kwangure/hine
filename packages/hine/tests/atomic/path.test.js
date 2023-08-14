import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';

describe('path', () => {
	it('returns path with name', () => {
		const state = new AtomicState({
			name: 'state',
		});
		expect(state.path).toEqual(['state']);
	});
	it('returns path with empty string when missing name', () => {
		const state = new AtomicState();
		expect(state.path).toEqual(['']);
	});
});
