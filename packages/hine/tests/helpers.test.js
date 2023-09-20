import { expect, expectTypeOf, test } from 'vitest';
import { handler, state } from '../src/helpers.js';

test('compound state respects context types in actions and conditions', () => {
	const test01 = state({
		name: 'child0',
		context: {
			key0: String,
			willChangeType: String,
		},
		entry: [handler({ if: 'condition0', run: ['action0'] })],
		children: {
			child1: state({
				context: {
					key1: Number,
					willChangeType: Boolean,
				},
				entry: [handler({ if: 'condition1', run: ['action1'] })],
			}),
		},
	});

	test01.resolve({
		context: {
			key0: '0',
			willChangeType: 'foo',
		},
		actions: {
			action0({ ownerState }) {
				const context = ownerState.context;

				const key0 = context.get('key0');
				expectTypeOf(key0).toBeString();
				expect(key0).toBe('0');

				const willChangeType = context.get('willChangeType');
				expectTypeOf(willChangeType).toBeString();
				expect(willChangeType).toBe('foo');

				// @ts-expect-error
				context.get('non-existent');
			},
		},
		conditions: {
			condition0({ ownerState }) {
				const context = ownerState.context;

				const key0 = context.get('key0');
				expectTypeOf(key0).toBeString();
				expect(key0).toBe('0');

				const willChangeType = context.get('willChangeType');
				expectTypeOf(willChangeType).toBeString();
				expect(willChangeType).toBe('foo');

				// @ts-expect-error
				context.get('non-existent');

				return true;
			},
		},
		children: {
			child1: {
				context: {
					key1: 1,
					willChangeType: false,
				},
				actions: {
					action1({ ownerState }) {
						const context = ownerState.context;

						const key1 = context.get('key1');
						expectTypeOf(key1).toBeNumber();
						expect(key1).toBe(1);

						const key0 = context.get('key0');
						expectTypeOf(key0).toBeString();
						expect(key0).toBe('0');

						const willChangeType = context.get('willChangeType');
						expectTypeOf(willChangeType).toBeBoolean();
						expect(willChangeType).toBe(false);

						// @ts-expect-error
						context.get('non-existent');
					},
				},
				conditions: {
					condition1({ ownerState }) {
						const context = ownerState.context;
						const key1 = context.get('key1');
						expectTypeOf(key1).toBeNumber();
						expect(key1).toBe(1);

						const key0 = context.get('key0');
						expectTypeOf(key0).toBeString();
						expect(key0).toBe('0');

						const willChangeType = context.get('willChangeType');
						expectTypeOf(willChangeType).toBeBoolean();
						expect(willChangeType).toBe(false);

						// @ts-expect-error
						context.get('non-existent');

						return true;
					},
				},
			},
		},
	});
});
