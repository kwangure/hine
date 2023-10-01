import type {
	ActionRunnerConfig,
	BaseRunnerConfig,
	ConditionRunnerConfig,
} from '../runner/types.js';
import type { AtomicState } from './atomic.js';
import type { CompoundState } from './compound.js';
import type { EffectHandler } from '../handler/effect.js';
import type { HandlerJSON } from '../handler/types.js';
import type { TransitionHandler } from '../handler/transition.js';
import { BaseState } from './base.js';
import { ContextType } from '../context/types.js';

export type StateNode = AtomicState<any, any> | CompoundState<any, any>;

export interface BaseStateTypes {
	context?: Record<string, any>;
}

export interface BaseStateConfig {
	always?: (EffectHandler | TransitionHandler)[];
	entry?: EffectHandler[];
	exit?: EffectHandler[];
	name?: string;
	on?: Record<string, (EffectHandler | TransitionHandler)[]>;
	types?: BaseStateTypes;
}

export interface AtomicStateConfig extends BaseStateConfig {}

export interface CompoundStateConfig extends BaseStateConfig {
	children: Record<string, StateNode>;
}

export interface StateConfig extends BaseStateConfig {
	children?: Record<string, StateNode>;
}

export interface BaseResolveConfig {
	actions?: Record<
		string,
		ActionRunnerConfig<any, any> | ActionRunnerConfig<any, any>['run']
	>;
	actionConfig?: BaseRunnerConfig;
	conditions?: Record<
		string,
		ConditionRunnerConfig<any, any> | ConditionRunnerConfig<any, any>['run']
	>;
	conditionConfig?: BaseRunnerConfig;
	context?: Record<string, unknown>;
}

export interface AtomicResolveConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> extends BaseResolveConfig {
	actions?: Record<
		string,
		| ActionRunnerConfig<TStateConfig, TContextAncestor>
		| ActionRunnerConfig<TStateConfig, TContextAncestor>['run']
	>;
	conditions?: Record<
		string,
		| ConditionRunnerConfig<TStateConfig, TContextAncestor>
		| ConditionRunnerConfig<TStateConfig, TContextAncestor>['run']
	>;
	context?: ContextType<TStateConfig, Record<string, any>>;
}

export interface CompoundResolveConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> extends BaseResolveConfig {
	actions?: Record<
		string,
		| ActionRunnerConfig<TStateConfig, TContextAncestor>
		| ActionRunnerConfig<TStateConfig, TContextAncestor>['run']
	>;
	conditions?: Record<
		string,
		| ConditionRunnerConfig<TStateConfig, TContextAncestor>
		| ConditionRunnerConfig<TStateConfig, TContextAncestor>['run']
	>;
	context: ContextType<TStateConfig, Record<string, any>>;
	children?: Partial<{
		[child in keyof TStateConfig['children']]: TStateConfig['children'][child] extends CompoundState<
			infer TCompoundStateConfig,
			Record<string, any>
		>
			? RequireContext<
					TCompoundStateConfig,
					CompoundResolveConfig<
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
			: TStateConfig['children'][child];
	}>;
}

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

export type StateNodeJSON = AtomicStateJSON | CompoundStateJSON;

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
