import { describe, it } from 'vitest';
import { compound } from './compound.js';

describe('config', () => {
	it('requires children', () => {
		// @ts-expect-error
		() => compound({});
	});
});
