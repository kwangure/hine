import { describe, it, expect } from 'vitest';
import { normalizeListener } from './util.js';
import type { StateEvent } from './event/event.js';
import type { Run, StateEventListener } from './types.js';

describe('normalizeListener', () => {
	it('should normalize a function to a run', () => {
		const fn = (event: StateEvent) => event.type;
		expect(normalizeListener(fn)).toEqual([{ run: fn }]);
	});

	it('should normalize a string to a goto', () => {
		expect(normalizeListener('nextState')).toEqual([{ goto: 'nextState' }]);
	});

	it('should normalize an object', () => {
		const obj = {
			if: (event: StateEvent) => event.type === 'click',
			run: () => console.log('clicked'),
			goto: 'nextState',
		};
		expect(normalizeListener(obj)).toEqual([obj]);
	});

	it('should normalize an array of functions', () => {
		const fns = [() => {}, (event: StateEvent) => event.type];
		expect(normalizeListener(fns)).toEqual(fns.map((fn) => ({ run: fn })));
	});

	it('should normalize an array of strings', () => {
		const strings = ['state1', 'state2'];
		expect(normalizeListener(strings)).toEqual(
			strings.map((str) => ({ goto: str })),
		);
	});

	it('should normalize an array of objects', () => {
		const objects = [
			{ if: () => true },
			{ run: () => {} },
			{ goto: 'state' },
		];
		expect(normalizeListener(objects)).toEqual(objects);
	});

	it('should normalize a mixed array', () => {
		const mixed = [() => {}, 'state', { if: () => true, run: () => {} }];
		expect(normalizeListener(mixed)).toEqual([
			{ run: mixed[0] as Run },
			{ goto: 'state' },
			mixed[2] as StateEventListener,
		]);
	});
});
