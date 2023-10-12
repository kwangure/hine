import { describe, it } from 'vitest';
import { parallel } from './parallel.js';

describe('types', () => {
	it('requires children', () => {
		// @ts-expect-error
		() => parallel({});
	});
});
