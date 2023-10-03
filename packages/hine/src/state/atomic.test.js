import { atomic } from './atomic.js';
import { describe, it } from 'vitest';

describe('types', () => {
	it('forbids additional properties in config', () => {
		// @ts-expect-error
		atomic({ children: {} });
	});
});
