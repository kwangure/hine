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
		expect(() => context.update('key', 'value')).toThrow(
			/Attempted to update key/,
		);
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

	it('checks update type from context transformer', () => {
		const state = new BaseState();
		const context = new Context(state, {
			/** @param {number} x */
			key1: (x) => String(x),
			key2: Number,
		});

		context.__set('key1', 0);
		context.__set('key2', '104');

		context.update('key1', 1);
		// @ts-expect-error
		context.update('key1', '');
		context.update('key2', ''); // Number constructor takes any as input
		// @ts-expect-error
		() => context.update('non-existent', '');
	});

	it('allows any get type when context transformer is not defined', () => {
		const state = new BaseState();
		const context = new Context(state);

		context.get('possibly-non-existent');
	});

	it('allows any update type when context transformer is not defined', () => {
		const state = new BaseState();
		const context = new Context(state);

		() => context.update('possibly-non-existent', 1000);
	});
});
