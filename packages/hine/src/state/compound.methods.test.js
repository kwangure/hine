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
