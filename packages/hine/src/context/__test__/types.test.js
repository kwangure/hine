import { atomic, compound, parallel } from '../../helpers.js';
import { expect, expectTypeOf, test } from 'vitest';
import { AtomicState } from '../../state/atomic.js';
import { CompoundState } from '../../state/compound.js';
import { ParallelState } from '../../state/parallel.js';

test('atomic state respects context types in actions and conditions', () => {
	const stateMachine = atomic({
		name: 'child0',
		types: {
			context: /** @type {{ key01: string; willChangeType: string; }} */ ({}),
		},
		entry: { if: 'condition0', run: ['action0'] },
	});

	stateMachine.resolve({
		context: {
			key01: '01',
			willChangeType: 'foo',
		},
		actions: {
			action0(state) {
				expectTypeOf(state).toMatchTypeOf(
					/** @type {AtomicState<any, any>} */ (new AtomicState({})),
				);
				const { context } = state;
				const key01 = context.get('key01');
				expectTypeOf(key01).toBeString();
				expect(key01).toBe('01');
				context.update('key01', 'foo');

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
			condition0(state) {
				expectTypeOf(state).toMatchTypeOf(
					/** @type {AtomicState<any, any>} */ (new AtomicState({})),
				);
				const { context } = state;
				const key01 = context.get('key01');
				expectTypeOf(key01).toBeString();
				expect(key01).toBe('01');

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
	const stateMachine = compound({
		name: 'child0',
		types: {
			context: /** @type {{ key01: string; willChangeType: string; }} */ ({}),
		},
		entry: { if: 'condition0', run: ['action0'] },
		children: {
			child1: atomic({
				types: {
					context:
						/** @type {{ key11: number; willChangeType: boolean; }} */ ({}),
				},
				entry: { if: 'condition1', run: ['action1'] },
			}),
		},
	});

	stateMachine.resolve({
		context: {
			key01: '01',
			willChangeType: 'foo',
		},
		actions: {
			action0(state) {
				expectTypeOf(state).toMatchTypeOf(
					/** @type {CompoundState<any, any>} */ (new CompoundState({})),
				);
				const { context } = state;
				const key01 = context.get('key01');
				expectTypeOf(key01).toBeString();
				expect(key01).toBe('01');

				const willChangeType = context.get('willChangeType');
				expectTypeOf(willChangeType).toBeString();
				expect(willChangeType).toBe('foo');

				// @ts-expect-error
				context.get('non-existent');
			},
		},
		conditions: {
			condition0(state) {
				expectTypeOf(state).toMatchTypeOf(
					/** @type {CompoundState<any, any>} */ (new CompoundState({})),
				);
				const { context } = state;
				const key01 = context.get('key01');
				expectTypeOf(key01).toBeString();
				expect(key01).toBe('01');

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
					key11: 1,
					willChangeType: false,
				},
				actions: {
					action1(state) {
						const { context } = state;
						const key11 = context.get('key11');
						expectTypeOf(key11).toBeNumber();
						expect(key11).toBe(1);

						const key01 = context.get('key01');
						expectTypeOf(key01).toBeString();
						expect(key01).toBe('01');

						const willChangeType = context.get('willChangeType');
						expectTypeOf(willChangeType).toBeBoolean();
						expect(willChangeType).toBe(false);

						// @ts-expect-error
						context.get('non-existent');
					},
				},
				conditions: {
					condition1({ context }) {
						const key1 = context.get('key11');
						expectTypeOf(key1).toBeNumber();
						expect(key1).toBe(1);

						const key01 = context.get('key01');
						expectTypeOf(key01).toBeString();
						expect(key01).toBe('01');

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

	stateMachine.append(
		{
			s1: compound({
				types: {
					context: /** @type {{ key02: string }} */ ({}),
				},
				children: {
					s11: atomic({}),
				},
			}),
		},
		{
			s1: {
				context: {
					key02: '02',
				},
				actions: {
					action1(state) {
						expectTypeOf(state).toMatchTypeOf(
							/** @type {CompoundState<any, any>} */ (new CompoundState({})),
						);
						const { context } = state;
						const key02 = context.get('key02');
						expectTypeOf(key02).toBeString();
						expect(key02).toBe('02');

						const key01 = context.get('key01');
						expectTypeOf(key01).toBeString();
						expect(key01).toBe('01');

						const willChangeType = context.get('willChangeType');
						expectTypeOf(willChangeType).toBeString();
						expect(willChangeType).toBe('foo');

						// @ts-expect-error
						context.get('non-existent');
					},
				},
				conditions: {
					condition1(state) {
						expectTypeOf(state).toMatchTypeOf(
							/** @type {CompoundState<any, any>} */ (new CompoundState({})),
						);
						const { context } = state;
						const key02 = context.get('key02');
						expectTypeOf(key02).toBeString();
						expect(key02).toBe('02');

						const key01 = context.get('key01');
						expectTypeOf(key01).toBeString();
						expect(key01).toBe('01');

						const willChangeType = context.get('willChangeType');
						expectTypeOf(willChangeType).toBeString();
						expect(willChangeType).toBe(false);

						// @ts-expect-error
						context.get('non-existent');

						return true;
					},
				},
			},
		},
	);
});

test('parallel state respects context types in actions and conditions', () => {
	const stateMachine = parallel({
		name: 'child0',
		types: {
			context: /** @type {{ key01: string; willChangeType: string; }} */ ({}),
		},
		entry: { if: 'condition0', run: ['action0'] },
		children: {
			child1: parallel({
				types: {
					context:
						/** @type {{ key11: number; willChangeType: boolean; }} */ ({}),
				},
				entry: { if: 'condition1', run: ['action1'] },
				children: {
					child11: atomic({
						types: {
							context:
								/** @type {{ key11: number; willChangeType: boolean; }} */ ({}),
						},
						entry: { if: 'condition1', run: ['action1'] },
					}),
				},
			}),
		},
	});

	stateMachine.resolve({
		context: {
			key01: '01',
			willChangeType: 'foo',
		},
		actions: {
			action0(state) {
				expectTypeOf(state).toMatchTypeOf(
					/** @type {ParallelState<any, any>} */ (new ParallelState({})),
				);
				const { context } = state;
				const key01 = context.get('key01');
				expectTypeOf(key01).toBeString();
				expect(key01).toBe('01');

				const willChangeType = context.get('willChangeType');
				expectTypeOf(willChangeType).toBeString();
				expect(willChangeType).toBe('foo');

				// @ts-expect-error
				context.get('non-existent');
			},
		},
		conditions: {
			condition0(state) {
				expectTypeOf(state).toMatchTypeOf(
					/** @type {ParallelState<any, any>} */ (new ParallelState({})),
				);
				const { context } = state;
				const key01 = context.get('key01');
				expectTypeOf(key01).toBeString();
				expect(key01).toBe('01');

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
					key11: 1,
					willChangeType: false,
				},
				actions: {
					action1(state) {
						expectTypeOf(state).toMatchTypeOf(
							/** @type {ParallelState<any, any>} */ (new ParallelState({})),
						);
						const { context } = state;
						const key11 = context.get('key11');
						expectTypeOf(key11).toBeNumber();
						expect(key11).toBe(1);

						const key01 = context.get('key01');
						expectTypeOf(key01).toBeString();
						expect(key01).toBe('01');

						const willChangeType = context.get('willChangeType');
						expectTypeOf(willChangeType).toBeBoolean();
						expect(willChangeType).toBe(false);

						// @ts-expect-error
						context.get('non-existent');
					},
				},
				conditions: {
					condition1(state) {
						expectTypeOf(state).toMatchTypeOf(
							/** @type {ParallelState<any, any>} */ (new ParallelState({})),
						);
						const { context } = state;
						const key1 = context.get('key11');
						expectTypeOf(key1).toBeNumber();
						expect(key1).toBe(1);

						const key01 = context.get('key01');
						expectTypeOf(key01).toBeString();
						expect(key01).toBe('01');

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

	stateMachine.append(
		{
			s1: compound({
				types: {
					context: /** @type {{ key02: string }} */ ({}),
				},
				children: {
					s11: atomic({}),
				},
			}),
		},
		{
			s1: {
				context: {
					key02: '02',
				},
				actions: {
					action1(state) {
						expectTypeOf(state).toMatchTypeOf(
							/** @type {CompoundState<any, any>} */ (new CompoundState({})),
						);
						const { context } = state;
						const key02 = context.get('key02');
						expectTypeOf(key02).toBeString();
						expect(key02).toBe('02');

						const key01 = context.get('key01');
						expectTypeOf(key01).toBeString();
						expect(key01).toBe('01');

						const willChangeType = context.get('willChangeType');
						expectTypeOf(willChangeType).toBeString();
						expect(willChangeType).toBe('foo');

						// @ts-expect-error
						context.get('non-existent');
					},
				},
				conditions: {
					condition1({ context }) {
						const key02 = context.get('key02');
						expectTypeOf(key02).toBeString();
						expect(key02).toBe('02');

						const key01 = context.get('key01');
						expectTypeOf(key01).toBeString();
						expect(key01).toBe('01');

						const willChangeType = context.get('willChangeType');
						expectTypeOf(willChangeType).toBeString();
						expect(willChangeType).toBe(false);

						// @ts-expect-error
						context.get('non-existent');

						return true;
					},
				},
			},
		},
	);
});

test('atomic state allows missing context types', () => {
	const stateMachine = atomic({
		name: 'child0',
	});

	stateMachine.resolve({
		context: {
			key01: '01',
		},
		actions: {
			action0({ context }) {
				context.get('non-existent');
				// @ts-expect-error
				context.get(1);
			},
		},
		conditions: {
			condition0({ context }) {
				context.get('non-existent');
				// @ts-expect-error
				context.get(1);

				return true;
			},
		},
	});
});

test('compound allows missing context types', () => {
	const stateMachine = compound({
		name: 'child0',
		children: {
			child1: atomic(),
		},
	});

	stateMachine.resolve({
		context: {
			key01: '01',
		},
		actions: {
			action0({ context }) {
				context.get('non-existent');
				// @ts-expect-error
				context.get(1);
			},
		},
		conditions: {
			condition0({ context }) {
				context.get('non-existent');
				// @ts-expect-error
				context.get(1);

				return true;
			},
		},
		children: {
			child1: {
				context: {
					key11: 1,
				},
				actions: {
					action1({ context }) {
						context.get('non-existent');
						context.update('non-existent', '');
						// @ts-expect-error
						context.get(1);
					},
				},
				conditions: {
					condition1({ context }) {
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

	stateMachine.append(
		{
			s1: compound({
				children: {
					s11: atomic({}),
				},
			}),
		},
		{
			s1: {
				context: {
					key02: '02',
				},
				actions: {
					action1({ context }) {
						context.get('non-existent');
						// @ts-expect-error
						context.get(1);
					},
				},
				conditions: {
					condition1({ context }) {
						context.get('non-existent');
						context.update('non-existent', '');
						// @ts-expect-error
						context.get(1);

						return true;
					},
				},
			},
		},
	);
});

test('parallel allows missing context types', () => {
	const stateMachine = parallel({
		name: 'child0',
		children: {
			child1: atomic(),
		},
	});

	stateMachine.resolve({
		context: {
			key01: '01',
		},
		actions: {
			action0({ context }) {
				context.get('non-existent');
				// @ts-expect-error
				context.get(1);
			},
		},
		conditions: {
			condition0({ context }) {
				context.get('non-existent');
				// @ts-expect-error
				context.get(1);

				return true;
			},
		},
		children: {
			child1: {
				context: {
					key11: 1,
				},
				actions: {
					action1({ context }) {
						context.get('non-existent');
						// @ts-expect-error
						context.get(1);
					},
				},
				conditions: {
					condition1({ context }) {
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

	stateMachine.append(
		{
			s1: compound({
				children: {
					s11: atomic({}),
				},
			}),
		},
		{
			s1: {
				context: {
					key02: '02',
				},
				actions: {
					action1({ context }) {
						context.get('non-existent');
						// @ts-expect-error
						context.get(1);
					},
				},
				conditions: {
					condition1({ context }) {
						context.get('non-existent');
						context.update('non-existent', '');
						// @ts-expect-error
						context.get(1);

						return true;
					},
				},
			},
		},
	);
});

test('atomic state requires context if types have context', () => {
	const stateMachine = atomic({
		name: 'child0',
		types: {
			context: /** @type {{ key01: string; }} */ ({}),
		},
	});

	// @ts-expect-error
	stateMachine.resolve({});
});

test('compound state requires context if types have context', () => {
	const stateMachine = compound({
		name: 'child0',
		types: {
			context: /** @type {{ key01: string; }} */ ({}),
		},
		children: {
			child1: atomic({
				types: {
					context: /** @type {{ key11: number; }} */ ({}),
				},
			}),
		},
	});

	stateMachine.resolve({
		children: {
			// @ts-expect-error
			child1: {},
		},
	});

	stateMachine.append(
		{
			s1: compound({
				types: {
					context: /** @type {{ key01: string; }} */ ({}),
				},
				children: {
					s11: atomic({}),
				},
			}),
		},
		{
			// @ts-expect-error
			s1: {},
		},
	);
});

test('parallel state requires context if types have context', () => {
	const stateMachine = parallel({
		name: 'child0',
		types: {
			context: /** @type {{ key01: string; }} */ ({}),
		},
		children: {
			child1: atomic({
				types: {
					context: /** @type {{ key11: number; }} */ ({}),
				},
			}),
		},
	});

	stateMachine.resolve({
		children: {
			// @ts-expect-error
			child1: {},
		},
	});

	stateMachine.append(
		{
			s1: compound({
				types: {
					context: /** @type {{ key01: string; }} */ ({}),
				},
				children: {
					s11: atomic({}),
				},
			}),
		},
		{
			// @ts-expect-error
			s1: {},
		},
	);
});

test("atomic state doesn't require context if types don't have context", () => {
	const stateMachine2 = atomic({
		name: 'child0',
	});

	stateMachine2.resolve({});
});

test("compound state doesn't require context if types don't have context", () => {
	const stateMachine = compound({
		name: 'child0',
		children: {
			child1: atomic(),
		},
	});

	stateMachine.resolve({
		children: {
			child1: {},
		},
	});

	stateMachine.append(
		{
			s1: compound({
				children: {
					s11: atomic({}),
				},
			}),
		},
		{
			s1: {},
		},
	);
});

test("parallel state doesn't require context if types don't have context", () => {
	const stateMachine = parallel({
		name: 'child0',
		children: {
			child1: atomic(),
		},
	});

	stateMachine.resolve({
		children: {
			child1: {},
		},
	});

	stateMachine.append(
		{
			s1: compound({
				children: {
					s11: atomic({}),
				},
			}),
		},
		{
			s1: {},
		},
	);
});
