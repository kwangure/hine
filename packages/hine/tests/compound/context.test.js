import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/state/atomic.js';
import { CompoundState } from '../../src/state/compound.js';
import { Context } from '../../src/context.js';

describe('context', () => {
	it('should return the context value for a given key', () => {
		const state = new CompoundState({
			children: { s1: new AtomicState() },
		});
		state.resolve({
			context: new Context({ key: 'value' }),
		});
		expect(state.context?.get('key')).toBe('value');
	});

	it('should return the parent context value for a given key', () => {
		const state = new CompoundState({
			children: { s1: new AtomicState() },
		});
		new CompoundState({
			children: {
				state,
			},
		}).resolve({
			context: new Context({ key: 'value' }),
		});
		expect(state.context?.get('key')).toBe('value');
	});

	it('should return the closest context ancestor value for a given key', () => {
		const state = new CompoundState({
			children: { s1: new AtomicState() },
		});
		new CompoundState({
			children: {
				s1: new CompoundState({
					children: { state },
				}),
			},
		}).resolve({
			context: new Context({ key: 'value0' }),
			children: {
				s1: {
					context: new Context({
						key: 'value1',
					}),
				},
			},
		});
		expect(state.context?.get('key')).toBe('value1');
	});
});
