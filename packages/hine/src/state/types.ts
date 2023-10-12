import type { Action, Condition } from '../runner/types.js';
import type {
	EffectHandlerConfig,
	TransitionHandlerConfig,
} from '../handler/types.js';
import type { AtomicState } from './atomic.js';
import type { BaseState } from './base.js';
import type { CompoundState } from './compound.js';
import type { ForceToLiteralString } from '../type-utils/force-to-literal.js';
import { Merge } from '../context/types.js';
import { ParallelState } from './parallel.js';
import type { EmptyObject } from '../type-utils/empty-object.js';
import type { Simplify } from '../type-utils/simplify.js';
import type { UnionToIntersection } from '../type-utils/union-to-intersection.js';

export type StateNode =
	| AtomicState<any, any>
	| CompoundState<any, any>
	| ParallelState<any, any>;

export interface BaseStateTypes {
	context?: Record<string, any>;
}

export interface BaseStateConfig<TName extends string = string> {
	always?:
		| string
		| EffectHandlerConfig
		| TransitionHandlerConfig
		| (string | EffectHandlerConfig | TransitionHandlerConfig)[];
	entry?: string | EffectHandlerConfig | (string | EffectHandlerConfig)[];
	exit?: string | EffectHandlerConfig | (string | EffectHandlerConfig)[];
	name?: TName;
	on?: Record<
		string,
		| string
		| EffectHandlerConfig
		| TransitionHandlerConfig
		| (string | EffectHandlerConfig | TransitionHandlerConfig)[]
	>;
	types?: BaseStateTypes;
}

export interface AtomicStateConfig<TName extends string>
	extends BaseStateConfig<TName> {}

export interface CompoundStateConfig<TName extends string>
	extends BaseStateConfig<TName> {
	children: Record<string, StateNode>;
}

export interface ParallelStateConfig<TName extends string>
	extends BaseStateConfig<TName> {
	children: Record<string, StateNode>;
}

export interface StateConfig extends BaseStateConfig {
	children?: Record<string, StateNode>;
}

export interface BaseResolveConfig {
	actions?: Record<string, Action<any>>;
	conditions?: Record<string, Condition<any>>;
	context?: Record<string, unknown>;
}

export interface AtomicResolveConfig<TState extends BaseState<any, any>>
	extends BaseResolveConfig {
	actions?: Record<string, Action<TState>>;
	conditions?: Record<string, Condition<TState>>;
	context?: TState['__$context'];
}

export interface ParentResolveConfig<
	TContextAncestor extends Record<string, any>,
	TState extends BaseState<any, any>,
> extends BaseResolveConfig {
	actions?: Record<string, Action<TState>>;
	conditions?: Record<string, Condition<TState>>;
	context?: TState['__$context'];
	children?: Partial<{
		[child in keyof TState['__$config']['children'] &
			string]: TState['__$config']['children'][child] extends ParallelState<
			any,
			any
		>
			? RequireContext<
					TState['__$config']['children'][child]['__$config'],
					ParentResolveConfig<
						TState['__$context'],
						ParallelState<
							Merge<
								// Make these optional so that if an action or condition is not defined
								// directly as an object property (e.g. in a different file), you do not
								// have to specify them action/condition config argument...
								SetOptional<
									TState['__$config']['children'][child]['__$config'],
									'always' | 'entry' | 'exit' | 'on'
								>,
								{ name?: child }
							>,
							Merge<TContextAncestor, TState['__$context']>
						>
					>
			  >
			: TState['__$config']['children'][child] extends CompoundState<any, any>
			? RequireContext<
					TState['__$config']['children'][child]['__$config'],
					ParentResolveConfig<
						TState['__$context'],
						CompoundState<
							Merge<
								// Make these optional so that if an action or condition is not defined
								// directly as an object property (e.g. in a different file), you do not
								// have to specify them action/condition config argument...
								SetOptional<
									TState['__$config']['children'][child]['__$config'],
									'always' | 'entry' | 'exit' | 'on'
								>,
								{ name?: child }
							>,
							Merge<TContextAncestor, TState['__$context']>
						>
					>
			  >
			: TState['__$config']['children'][child] extends AtomicState<any, any>
			? RequireContext<
					TState['__$config']['children'][child]['__$config'],
					AtomicResolveConfig<
						AtomicState<
							Merge<
								// Make these optional so that if an action or condition is not defined
								// directly as an object property (e.g. in a different file), you do not
								// have to specify them action/condition config argument...
								SetOptional<
									TState['__$config']['children'][child]['__$config'],
									'always' | 'entry' | 'exit' | 'on'
								>,
								{ name?: child }
							>,
							Merge<TContextAncestor, TState['__$context']>
						>
					>
			  >
			: AtomicResolveConfig<
					BaseState<
						Merge<
							SetOptional<
								// Make these optional so that if an action or condition is not defined
								// directly as an object property (e.g. in a different file), you do not
								// have to specify them action/condition config argument...
								TState['__$config']['children'][child]['__$config'],
								'always' | 'entry' | 'exit' | 'on'
							>,
							{ name?: child }
						>,
						Merge<TContextAncestor, TState['__$context']>
					>
			  >;
	}>;
}

export type ReplaceChildren<T, U> = Omit<T, 'children'> & { children: U };

// If `context` is defined on the `types` state config, we want to require
// context data in the resolve config
export type RequireContext<
	TStateConfig extends BaseStateConfig<string>,
	TResolveConfig extends BaseResolveConfig,
> = Simplify<
	TStateConfig['types'] extends { context: Record<string, any> }
		? Required<Pick<TResolveConfig, 'context'>> &
				Omit<TResolveConfig, 'context'>
		: Partial<Pick<TResolveConfig, 'context'>> & Omit<TResolveConfig, 'context'>
>;

export type SetOptional<T, K extends keyof any> = Simplify<
	{
		[P in Exclude<keyof T, K>]: T[P];
	} & {
		[P in K as P extends keyof T ? P : never]?: P extends keyof T
			? T[P]
			: never;
	}
>;

export type StatePaths<T extends BaseState<any, any>> = Simplify<
	{
		[K in ForceToLiteralString<T['name']>]: T;
	} & (T['__$config']['children'] extends Record<string, StateNode>
		? Flatten<
				T['__$config']['children'],
				ForceToLiteralString<T['name']>,
				T['__$context']
		  >
		: {})
>;

type FlattenChildren<
	T extends Record<string, StateNode>,
	P extends string,
	TContextAncestor extends Record<string, any>,
> =
	// Exclude empty object since `keyof {}` is `never`
	T extends EmptyObject
		? {}
		: UnionToIntersection<
				{
					[K in keyof T & string]: T[K]['__$config'] extends {
						children: infer C;
					}
						? C extends Record<string, any>
							? Flatten<C, `${P}.${K}`, TContextAncestor>
							: {}
						: {};
				}[keyof T & string]
		  >;

type Flatten<
	T extends Record<string, StateNode>,
	P extends string,
	TContextAncestor extends Record<string, any>,
> = Simplify<
	{
		[K in keyof T & string as `${P}.${K}`]: T[K] extends ParallelState<any, any>
			? ParallelState<
					Merge<T[K]['__$config'], { name: K }>,
					Merge<TContextAncestor, T[K]['__$context']>
			  >
			: T[K] extends CompoundState<any, any>
			? CompoundState<
					Merge<T[K]['__$config'], { name: K }>,
					Merge<TContextAncestor, T[K]['__$context']>
			  >
			: T[K] extends AtomicState<any, any>
			? AtomicState<
					Merge<T[K]['__$config'], { name: K }>,
					Merge<TContextAncestor, T[K]['__$context']>
			  >
			: BaseState<
					Merge<T[K]['__$config'], { name: K }>,
					Merge<TContextAncestor, T[K]['__$context']>
			  >;
	} & FlattenChildren<T, P, TContextAncestor>
>;

export type CollectStateConfigs<TStateConfig> = TStateConfig extends StateConfig
	?
			| keyof NonNullable<TStateConfig['on']>
			| {
					[child in keyof TStateConfig['children']]: TStateConfig['children'][child] extends BaseState<
						infer TChildStateConfig,
						any
					>
						? CollectStateConfigs<TChildStateConfig>
						: never;
			  }[keyof TStateConfig['children']]
	: never;
