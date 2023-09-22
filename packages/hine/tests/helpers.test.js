import { expect, expectTypeOf, test } from 'vitest';
import { handler, state } from '../src/helpers.js';
import { AtomicState } from '../src/state/atomic.js';
import { CompoundState } from '../src/state/compound.js';

test('atomic state respects context types in actions and conditions', () => {
	const stateMachine = state({
		name: 'child0',
		context: {
			key0: String,
			willChangeType: String,
		},
		entry: [handler({ if: 'condition0', run: ['action0'] })],
	});

	expectTypeOf(stateMachine).toMatchTypeOf(
		/** @type {AtomicState<any, any>} */ (new AtomicState({})),
	);

	stateMachine.resolve({
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
	});
});

test('compound state respects context types in actions and conditions', () => {
	const stateMachine = state({
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

	expectTypeOf(stateMachine).toMatchTypeOf(
		/** @type {CompoundState<any, any>} */ (
			new CompoundState({
				children: {
					s1: new AtomicState({}),
				},
			})
		),
	);

	stateMachine.resolve({
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
