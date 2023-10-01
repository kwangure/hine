import { expect, expectTypeOf, test } from 'vitest';
import { handler, state } from '../../helpers.js';
import { AtomicState } from '../../state/atomic.js';
import { CompoundState } from '../../state/compound.js';

test('atomic state respects context types in actions and conditions', () => {
	const stateMachine = state({
		name: 'child0',
		types: {
			context: /** @type {{ key0: string; willChangeType: string; }} */ ({}),
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
				context.update('key0', 'foo');

				const willChangeType = context.get('willChangeType');
				expectTypeOf(willChangeType).toBeString();
				expect(willChangeType).toBe('foo');
				context.update('willChangeType', 'bar');

				// @ts-expect-error
				context.get('non-existent');
				// @ts-expect-error
				() => context.update('non-existent', 10);
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
				// @ts-expect-error
				() => context.update('non-existent', 10);

				return true;
			},
		},
	});
});

test('compound state respects context types in actions and conditions', () => {
	const stateMachine = state({
		name: 'child0',
		types: {
			context: /** @type {{ key0: string; willChangeType: string; }} */ ({}),
		},
		entry: [handler({ if: 'condition0', run: ['action0'] })],
		children: {
			child1: state({
				types: {
					context:
						/** @type {{ key1: number; willChangeType: boolean; }} */ ({}),
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

test('atomic state allows missing context types', () => {
	const stateMachine = state({
		name: 'child0',
		entry: [handler({ if: 'condition0', run: ['action0'] })],
	});

	expectTypeOf(stateMachine).toMatchTypeOf(
		/** @type {AtomicState<any, any>} */ (new AtomicState({})),
	);

	stateMachine.resolve({
		context: {
			key0: '0',
		},
		actions: {
			action0({ ownerState }) {
				const context = ownerState.context;

				context.get('non-existent');
				// @ts-expect-error
				context.get(1);
			},
		},
		conditions: {
			condition0({ ownerState }) {
				const context = ownerState.context;

				context.get('non-existent');
				// @ts-expect-error
				context.get(1);

				return true;
			},
		},
	});
});

test('compound allows missing context types', () => {
	const stateMachine = state({
		name: 'child0',
		entry: [handler({ if: 'condition0', run: ['action0'] })],
		children: {
			child1: state({
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
		},
		actions: {
			action0({ ownerState }) {
				const context = ownerState.context;

				context.get('non-existent');
				// @ts-expect-error
				context.get(1);
			},
		},
		conditions: {
			condition0({ ownerState }) {
				const context = ownerState.context;

				context.get('non-existent');
				// @ts-expect-error
				context.get(1);

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

						context.get('non-existent');
						// @ts-expect-error
						context.get(1);
					},
				},
				conditions: {
					condition1({ ownerState }) {
						const context = ownerState.context;

						context.get('non-existent');
						context.update('non-existent', '');
						// @ts-expect-error
						context.get(1);

						return true;
					},
				},
			},
		},
	});
});

test('atomic state requires context if types have context', () => {
	const stateMachine = state({
		name: 'child0',
		types: {
			context: /** @type {{ key0: string; }} */ ({}),
		},
	});

	expectTypeOf(stateMachine).toMatchTypeOf(
		/** @type {AtomicState<any, any>} */ (new AtomicState({})),
	);

	// @ts-expect-error
	stateMachine.resolve({});
});

test('compound state requires context if types have context', () => {
	const stateMachine = state({
		name: 'child0',
		types: {
			context: /** @type {{ key0: string; }} */ ({}),
		},
		children: {
			child1: state({
				types: {
					context: /** @type {{ key1: number; }} */ ({}),
				},
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
		children: {
			// @ts-expect-error
			child1: {},
		},
	});
});

test("atomic state doesn't require context if types don't have context", () => {
	const stateMachine2 = state({
		name: 'child0',
	});

	expectTypeOf(stateMachine2).toMatchTypeOf(
		/** @type {AtomicState<any, any>} */ (new AtomicState({})),
	);

	stateMachine2.resolve({});
});

test("compound state doesn't require context if types don't have context", () => {
	const stateMachine = state({
		name: 'child0',
		children: {
			child1: state(),
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
		children: {
			child1: {},
		},
	});
});
