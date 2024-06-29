import { describe, it, expect, assert } from 'vitest';
import {
	fromPromise,
	isPromiseStateEvent,
	type PromiseStateEvent,
} from './fromPromise';
import { matches, resolveState } from 'hine';

describe('fromPromise', () => {
	it('has pending, resolved, and rejected states', () => {
		const promise = Promise.resolve();
		const stateConfig = fromPromise('foo', promise);
		const state = resolveState(stateConfig);

		assert(state.children.has('pending'));
		assert(state.children.has('resolved'));
		assert(state.children.has('rejected'));
	});

	it('performs state transitions', async () => {
		const promise = Promise.resolve();
		const stateConfig = fromPromise('foo', promise);
		const state = resolveState(stateConfig);

		assert(matches(state, 'foo.pending'));
		await promise;
		assert(matches(state, 'foo.resolved'));
	});

	it('resolves promises', async () => {
		let value = '';

		const promise = Promise.resolve('foo');
		const stateConfig = fromPromise('bar', promise, {
			on: {
				resolve(event) {
					value = (event as PromiseStateEvent).detail
						.result as string;
				},
			},
		});
		resolveState(stateConfig);

		expect(value).toBe('');
		await promise;
		expect(value).toBe('foo');
	});

	it('rejects promises', async () => {
		let value = '';

		const promise = Promise.reject('foo');
		const stateConfig = fromPromise('bar', promise, {
			on: {
				reject(event) {
					value = (event as PromiseStateEvent).detail
						.result as string;
				},
			},
		});
		resolveState(stateConfig);

		expect(value).toBe('');
		try {
			await promise.catch();
			/* eslint-disable-next-line no-empty */
		} catch {}
		expect(value).toBe('foo');
	});

	it('calls custom hooks', () => {
		const promise = Promise.resolve();
		let value: string = '';
		const stateConfig = fromPromise('foo', promise, {
			hooks: {
				afterEntry: () => (value = 'bar'),
			},
		});
		resolveState(stateConfig);

		expect(value).toBe('bar');
	});
});

describe('isPromiseStateEvent', () => {
	it('should return true for valid PromiseStateEvents', () => {
		const validEvent = {
			type: 'resolve',
			detail: {
				result: 'test',
				promise: Promise.resolve(),
			},
		} as PromiseStateEvent;

		expect(isPromiseStateEvent(validEvent)).toBe(true);
	});

	it('should return false for invalid events', () => {
		const invalidEvent1 = { type: 'other' } as unknown as PromiseStateEvent;
		const invalidEvent2 = {
			type: 'resolve',
			detail: {},
		} as PromiseStateEvent;
		const invalidEvent3 = {
			type: 'resolve',
			detail: { result: 'test' },
		} as PromiseStateEvent;

		expect(isPromiseStateEvent(invalidEvent1)).toBe(false);
		expect(isPromiseStateEvent(invalidEvent2)).toBe(false);
		expect(isPromiseStateEvent(invalidEvent3)).toBe(false);
	});
});
