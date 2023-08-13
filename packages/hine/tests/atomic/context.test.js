import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
import { Context } from '../../src/context.js';

describe('context', () => {
	it('should return the context value for a given key', () => {
		const state = new AtomicState({
			context: new Context({ key: 'value' }),
		});
		state.start();
		expect(state.context?.get('key')).toBe('value');
	});

	it('should return the parent context value for a given key', () => {
		const state = new AtomicState();
		new CompoundState({
			context: new Context({ key: 'value' }),
			children: {
				state,
			},
		}).start();
		expect(state.context?.get('key')).toBe('value');
	});

	it('should return the closest context ancestor value for a given key', () => {
		const state = new AtomicState();
		new CompoundState({
			context: new Context({ key: 'value0' }),
			children: {
				s1: new CompoundState({
					context: new Context({
						key: 'value1',
					}),
					children: { state },
				}),
			},
		}).start();
		expect(state.context?.get('key')).toBe('value1');
	});
});
