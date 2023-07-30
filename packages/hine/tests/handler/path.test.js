import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src';
import { TransitionHandler } from '../../src/handler/transition.js';

describe('path', () => {
	it('returns path with name', () => {
		const handler = new TransitionHandler({
			name: 'handler',
		});
		expect(handler.path).toEqual(['[handler]']);
	});
	it('returns path with empty string when missing name', () => {
		// Warn against doing this via TypeScript but allow it in practice
		// @ts-ignore
		const handler = new TransitionHandler({});
		expect(handler.path).toEqual(['[]']);
	});
	it('includes ownerState path', () => {
		const state = new AtomicState({
			name: 'state',
			always: [{}],
		});
		state.monitor({});
		state.start();
		// Currently the only way the end user ever reaches a Handler object
		const eventIterator = state.step('event');
		const { value: handler, done } = eventIterator.next();

		// Help TypeScript out
		if (done) return;
		expect(handler.path).toEqual(['state', '[0]']);
	});
});
