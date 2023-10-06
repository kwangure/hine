import type { Action, Condition } from '../runner/types.js';
import type {
	EffectHandlerConfig,
	HandlerJSON,
	TransitionHandlerConfig,
} from '../handler/types.js';
import type { AtomicState } from './atomic.js';
import type { CompoundState } from './compound.js';
import { BaseState } from './base.js';
import { ContextType } from '../context/types.js';
import { ParallelState } from './parallel.js';

export type StateNode =
	| AtomicState<AtomicStateConfig, any>
	| CompoundState<CompoundStateConfig, any>
	| ParallelState<ParallelStateConfig, any>;

export interface BaseStateTypes {
	context?: Record<string, any>;
}

export interface BaseStateConfig {
	always?:
		| string
		| EffectHandlerConfig
		| TransitionHandlerConfig
		| (string | EffectHandlerConfig | TransitionHandlerConfig)[];
	entry?: string | EffectHandlerConfig | (string | EffectHandlerConfig)[];
	exit?: string | EffectHandlerConfig | (string | EffectHandlerConfig)[];
	name?: string;
	on?: Record<
		string,
		| string
		| EffectHandlerConfig
		| TransitionHandlerConfig
		| (string | EffectHandlerConfig | TransitionHandlerConfig)[]
	>;
	types?: BaseStateTypes;
}

export interface AtomicStateConfig extends BaseStateConfig {}

export interface AtomicStateConfigTransitionless extends AtomicStateConfig {
	always?: string | EffectHandlerConfig | (string | EffectHandlerConfig)[];
	on?: Record<
		string,
		string | EffectHandlerConfig | (string | EffectHandlerConfig)[]
	>;
}

export interface CompoundStateConfig extends BaseStateConfig {
	children: Record<string, StateNode>;
}

export interface CompoundStateConfigTransitionless extends CompoundStateConfig {
	always?: string | EffectHandlerConfig | (string | EffectHandlerConfig)[];
	on?: Record<
		string,
		string | EffectHandlerConfig | (string | EffectHandlerConfig)[]
	>;
}

export interface ParallelStateConfig extends BaseStateConfig {
	children: Record<
		string,
		| AtomicState<AtomicStateConfigTransitionless, any>
		| CompoundState<CompoundStateConfigTransitionless, any>
		| ParallelState<ParallelStateConfigTransitionless, any>
	>;
}

export interface ParallelStateConfigTransitionless extends ParallelStateConfig {
	always?: string | EffectHandlerConfig | (string | EffectHandlerConfig)[];
	on?: Record<
		string,
		string | EffectHandlerConfig | (string | EffectHandlerConfig)[]
	>;
}

export interface StateConfig extends BaseStateConfig {
	children?: Record<string, StateNode>;
}

export interface BaseResolveConfig {
	actions?: Record<string, Action<any, any>>;
	conditions?: Record<string, Condition<any, any>>;
	context?: Record<string, unknown>;
}

export interface AtomicResolveConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> extends BaseResolveConfig {
	actions?: Record<string, Action<TStateConfig, TContextAncestor>>;
	conditions?: Record<string, Condition<TStateConfig, TContextAncestor>>;
	context?: ContextType<TStateConfig, Record<string, any>>;
}

export interface ParentResolveConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> extends BaseResolveConfig {
	actions?: Record<string, Action<TStateConfig, TContextAncestor>>;
	conditions?: Record<string, Condition<TStateConfig, TContextAncestor>>;
	context?: ContextType<TStateConfig, Record<string, any>>;
	children?: Partial<{
		[child in keyof TStateConfig['children']]: TStateConfig['children'][child] extends CompoundState<
			infer TCompoundStateConfig,
			Record<string, any>
		>
			? RequireContext<
					TCompoundStateConfig,
					ParentResolveConfig<
						TCompoundStateConfig,
						ContextType<TStateConfig, {}>
					>
			  >
			: TStateConfig['children'][child] extends AtomicState<
					infer TAtomicStateConfig,
					Record<string, any>
			  >
			? RequireContext<
					TAtomicStateConfig,
					AtomicResolveConfig<TAtomicStateConfig, ContextType<TStateConfig, {}>>
			  >
			: never;
	}>;
}

export type ReplaceChildren<T extends { children: any }, U> = Omit<
	T,
	'children'
> & { children: U };

export type Simplify<T> = { [key in keyof T]: T[key] } & {};

export type RequireContext<
	TStateConfig extends BaseStateConfig,
	TResolveConfig extends BaseResolveConfig,
> = Simplify<
	TStateConfig['types'] extends { context: Record<string, any> }
		? Required<Pick<TResolveConfig, 'context'>> &
				Omit<TResolveConfig, 'context'>
		: Partial<Pick<TResolveConfig, 'context'>> & Omit<TResolveConfig, 'context'>
>;

export interface BaseStateJSON {
	always: HandlerJSON[] | undefined;
	entry: HandlerJSON[] | undefined;
	exit: HandlerJSON[] | undefined;
	name: string;
	on: Record<string, HandlerJSON[]> | undefined;
	path: string[];
}

export interface AtomicStateJSON extends BaseStateJSON {
	type: 'atomic';
}

export interface CompoundStateJSON extends BaseStateJSON {
	type: 'compound';
	children: Record<string, StateNodeJSON>;
}

export interface ParallelStateJSON extends BaseStateJSON {
	type: 'parallel';
	children: Record<string, StateNodeJSON>;
}

export type StateNodeJSON =
	| AtomicStateJSON
	| CompoundStateJSON
	| ParallelStateJSON;

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

export type StateChildren<TStateConfig extends StateConfig> =
	CollectStateConfigs<TStateConfig>;
