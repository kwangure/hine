import { describe, it } from 'vitest';
import { compound } from './compound.js';

describe('types', () => {
	it('requires children', () => {
		// @ts-expect-error
		() => compound({});
	});
});
