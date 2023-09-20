import { describe, expect, expectTypeOf, it } from 'vitest';
import { BaseState } from '../state/base.js';
import { Context } from './context.js';

describe('basic', () => {
	it('returns undefined when getting non-existent key', () => {
		const state = new BaseState();
		const context = new Context(state, {});
		// @ts-expect-error
		expect(context.get('key')).toBe(undefined);
	});

	it('throws when setting non-existent key', () => {
		const state = new BaseState();
		const context = new Context(state, {});
		// @ts-expect-error
		expect(() => context.set('key', 'value')).toThrow(/Attempted to set key/);
	});
});

describe('typescript', () => {
	it('checks get type from context transformer', () => {
		const state = new BaseState();
		const context = new Context(state, {
			key1: String,
			key2: Number,
		});

		expectTypeOf(context.get('key1')).toEqualTypeOf('');
		expectTypeOf(context.get('key2')).toEqualTypeOf(0);
		// @ts-expect-error
		context.get('non-existent');
	});

	it('checks set type from context transformer', () => {
		const state = new BaseState();
		const context = new Context(state, {
			/** @param {number} x */
			key1: (x) => String(x),
			key2: Number,
		});

		context.set('key1', 0);
		// @ts-expect-error
		context.set('key1', '');
		context.set('key2', ''); // Number constructor takes any as input
		// @ts-expect-error
		() => context.set('non-existent', '');
	});

	it('allows any get type when context transformer is not defined', () => {
		const state = new BaseState();
		const context = new Context(state);

		context.get('possibly-non-existent');
	});

	it('allows any set type when context transformer is not defined', () => {
		const state = new BaseState();
		const context = new Context(state);

		context.set('possibly-non-existent', 1000);
	});
});
