import { describe, expect, it } from 'vitest';
import { atomic } from './atomic.js';
import { compound } from './compound.js';

describe('append', () => {
	it('runs entry events on appended children of resolved state', () => {
		const state = compound({ children: {} });
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
		const state = compound({
			children: {
				child: atomic({ entry: 'entry', on: { event: [] } }),
			},
		});
		state.resolve({
			children: {
				child: {
					actions: {
						entry(state) {
							let firstCall = true;
							// Subscribe during the course of an event in action. After the event all
							// subscribers are called, among which should be this one
							state.subscribe(() => {
								if (firstCall) {
									firstCall = false;
									return;
								}
								foo.push('subscribe');
							});
						},
					},
				},
			},
		});
		expect(foo).toEqual(['subscribe']);
	});
});
