import type { Action, Condition } from '../runner/types.js';
import type {
	EffectHandlerConfig,
	TransitionHandlerConfig,
} from '../handler/types.js';
import type { AtomicState } from './atomic.js';
import type { CompoundState } from './compound.js';
import { BaseState } from './base.js';
import { Merge } from '../context/types.js';
import { ParallelState } from './parallel.js';
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
		[child in keyof TState['__$config']['children']]: TState['__$config']['children'][child] extends ParallelState<
			any,
			any
		>
			? RequireContext<
					TState['__$config']['children'][child]['__$config'],
					ParentResolveConfig<
						TState['__$context'],
						ParallelState<
							TState['__$config']['children'][child]['__$config'],
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
							TState['__$config']['children'][child]['__$config'],
							Merge<TContextAncestor, TState['__$context']>
						>
					>
			  >
			: TState['__$config']['children'][child] extends AtomicState<any, any>
			? RequireContext<
					TState['__$config']['children'][child]['__$config'],
					AtomicResolveConfig<
						AtomicState<
							TState['__$config']['children'][child]['__$config'],
							Simplify<Merge<TContextAncestor, TState['__$context']>>
						>
					>
			  >
			: AtomicResolveConfig<
					BaseState<
						TState['__$config']['children'][child]['__$config'],
						Simplify<Merge<TContextAncestor, TState['__$context']>>
					>
			  >;
	}>;
}

export type ReplaceChildren<T, U> = Omit<T, 'children'> & { children: U };

export type RequireContext<
	TStateConfig extends BaseStateConfig<string>,
	TResolveConfig extends BaseResolveConfig,
> = Simplify<
	TStateConfig['types'] extends { context: Record<string, any> }
		? Required<Pick<TResolveConfig, 'context'>> &
				Omit<TResolveConfig, 'context'>
		: Partial<Pick<TResolveConfig, 'context'>> & Omit<TResolveConfig, 'context'>
>;

export type StatePaths<T extends BaseState<any, any>> = Simplify<
	{ [K in ForceToLiteralString<T['name']>]: T } & Flatten<
		T['__$config']['children'],
		ForceToLiteralString<T['name']>
	>
>;

type FlattenChildren<
	T extends Record<string, StateNode>,
	P extends string,
> = UnionToIntersection<
	{
		[K in keyof T & string]: T[K]['__$config'] extends { children: infer C }
			? C extends Record<string, any>
				? Flatten<C, `${P}.${K}`>
				: {}
			: {};
	}[keyof T & string]
>;

type Flatten<T extends Record<string, StateNode>, P extends string> = Simplify<
	{
		[K in keyof T & string as `${P}.${K}`]: T[K];
	} & FlattenChildren<T, P>
>;

export type CollectStateConfigs<TStateConfig> = TStateConfig extends StateConfig
	?
			| keyof TStateConfig['on']
			| {
					[child in keyof TStateConfig['children']]: TStateConfig['children'][child] extends BaseState<
						infer TChildStateConfig,
						any
					>
						? CollectStateConfigs<TChildStateConfig>
						: never;
			  }[keyof TStateConfig['children']]
	: never;
