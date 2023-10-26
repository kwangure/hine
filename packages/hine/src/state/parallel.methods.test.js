import { describe, expect, it } from 'vitest';
import { atomic } from './atomic.js';
import { parallel } from './parallel.js';

describe('append', () => {
	it('runs entry events on appended children of resolved state', () => {
		const state = parallel({ children: {} });
		state.resolve();
		let entry = '';
		state.append(
			{
				child: atomic({ entry: 'entryAction' }),
			},
			{
				child: {
					actions: { entryAction: () => (entry = 'ranEntry') },
				},
			},
		);
		expect(entry).toBe('ranEntry');
	});
});

describe('subscribe', () => {
	it('calls nested subscribers', () => {
		/** @type {string[]} */
		const foo = [];
		const state = parallel({
			children: {
				child1: atomic({ entry: 'entry1', on: { event: [] } }),
				child2: atomic({ entry: 'entry2', on: { event: [] } }),
			},
		});
		state.resolve({
			children: {
				child1: {
					actions: {
						entry1(state) {
							let firstCall = true;
							// Subscribe during the course of an event in action. After the event all
							// subscribers are called, among which should be this one
							state.subscribe(() => {
								if (firstCall) {
									firstCall = false;
									return;
								}
								foo.push('subscribe1');
							});
						},
					},
				},
				child2: {
					actions: {
						entry2(state) {
							let firstCall = true;
							// Subscribe during the course of an event in action. After the event all
							// subscribers are called, among which should be this one
							state.subscribe(() => {
								if (firstCall) {
									firstCall = false;
									return;
								}
								foo.push('subscribe2');
							});
						},
					},
				},
			},
		});
		expect(foo).toEqual(['subscribe1', 'subscribe2']);
	});
});
