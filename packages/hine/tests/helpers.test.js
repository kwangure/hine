import { expect, expectTypeOf, test } from 'vitest';
import { handler, state } from '../src/helpers.js';

test('compound state respects context types in actions and conditions', () => {
	const test01 = state({
		name: 'child0',
		context: {
			key0: String,
		},
		entry: [handler({ if: 'condition0', run: ['action0'] })],
		children: {
			child1: state({
				context: {
					key1: Number,
				},
				entry: [handler({ if: 'condition1', run: ['action1'] })],
			}),
		},
	});

	test01.resolve({
		context: {
			key0: '0',
		},
		actions: {
			action0({ ownerState }) {
				const context = ownerState.context;
				const key0 = context.get('key0');
				expectTypeOf(key0).toBeString();
				expect(key0).toBe('0');
			},
		},
		conditions: {
			condition0({ ownerState }) {
				const context = ownerState.context;
				const key0 = context.get('key0');
				expectTypeOf(key0).toBeString();
				expect(key0).toBe('0');
				return true;
			},
		},
		children: {
			child1: {
				context: {
					key1: 1,
				},
				actions: {
					action1({ ownerState }) {
						const context = ownerState.context;
						const key1 = context.get('key1');
						expectTypeOf(key1).toBeNumber();
						expect(key1).toBe(1);

						// @ts-expect-error TODO
						const key0 = context.get('key0');
						// TODO: expectTypeOf(key0).toBeString();
						expect(key0).toBe('0');
					},
				},
				conditions: {
					condition1({ ownerState }) {
						const context = ownerState.context;
						const key1 = context.get('key1');
						expectTypeOf(key1).toBeNumber();
						expect(key1).toBe(1);

						// @ts-expect-error TODO
						const key0 = context.get('key0');
						// TODO: expectTypeOf(key0).toBeString();
						expect(key0).toBe('0');

						return true;
					},
				},
			},
		},
	});
});
