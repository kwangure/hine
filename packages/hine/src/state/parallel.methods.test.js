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

describe('subscribe')
