import { describe, expect, it } from 'vitest';
import { BaseState } from '../../state/base.js';
import { Context } from '../context.js';

describe('basic', () => {
	it('returns undefined when getting non-existent key', () => {
		const state = new BaseState({});
		const context = new Context(state);
		expect(context.get('key')).toBe(undefined);
	});

	it('returns false when updating non-existent key', () => {
		const state = new BaseState({});
		const context = new Context(state);
		expect(context.update('key', 'value')).toBe(false);
	});

	it('returns true when updating existing key', () => {
		const state = new BaseState({});
		const context = new Context(state);
		context.__set('key', 'foo');
		expect(context.update('key', 'bar')).toBe(true);
	});

	it('returns true when key exists', () => {
		const state = new BaseState({});
		const context = new Context(state);
		context.__set('key', 'foo');
		expect(context.has('key')).toBe(true);
	});
});
