import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';
import { Context } from '../../src/context.js';

describe('context', () => {
	it('should return the context value for a given key', () => {
		const state = new CompoundState({
			context: new Context({ key: 'value' }),
			states: { s1: new AtomicState() },
		});
		state.start();
		expect(state.context?.get('key')).toBe('value');
	});

	it('should return the parent context value for a given key', () => {
		const state = new CompoundState({
			states: { s1: new AtomicState() },
		});
		new CompoundState({
			context: new Context({ key: 'value' }),
			states: {
				state,
			},
		}).start();
		expect(state.context?.get('key')).toBe('value');
	});

	it('should return the closest context ancestor value for a given key', () => {
		const state = new CompoundState({
			states: { s1: new AtomicState() },
		});
		new CompoundState({
			context: new Context({ key: 'value0' }),
			states: {
				s1: new CompoundState({
					context: new Context({
						key: 'value1',
					}),
					states: { state },
				}),
			},
		}).start();
		expect(state.context?.get('key')).toBe('value1');
	});
});
