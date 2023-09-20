import type {
	ActionRunnerConfig,
	BaseRunnerConfig,
	ConditionRunnerConfig,
} from '../runner/types.js';
import type { AtomicState } from './atomic.js';
import type { CompoundState } from './compound.js';
import type { ContextTransformer } from '../context/types.js';
import type { EffectHandler } from '../handler/effect.js';
import type { HandlerJSON } from '../handler/types.js';
import type { TransitionHandler } from '../handler/transition.js';

export type StateNode = AtomicState<any, any> | CompoundState<any, any>;

export interface BaseStateConfig {
	always?: (EffectHandler | TransitionHandler)[];
	context?: Record<string, ContextTransformer>;
	entry?: EffectHandler[];
	exit?: EffectHandler[];
	name?: string;
	on?: Record<string, (EffectHandler | TransitionHandler)[]>;
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
	TContextAncestor extends Record<string, ContextTransformer>,
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
	context?: {
		[key in keyof TStateConfig['context']]: TStateConfig['context'][key] extends ContextTransformer
			? ReturnType<TStateConfig['context'][key]>
			: never;
	};
}

export interface CompoundResolveConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, ContextTransformer>,
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
	context?: {
		[key in keyof TStateConfig['context']]: TStateConfig['context'][key] extends ContextTransformer
			? ReturnType<TStateConfig['context'][key]>
			: never;
	};
	children?: {
		[child in keyof TStateConfig['children']]: TStateConfig['children'][child] extends CompoundState<
			infer TCompoundStateConfig,
			Record<string, ContextTransformer>
		>
			? CompoundResolveConfig<
					TCompoundStateConfig,
					TStateConfig['context'] extends Record<string, ContextTransformer>
						? TStateConfig['context']
						: {}
			  >
			: TStateConfig['children'][child] extends AtomicState<
					infer TAtomicStateConfig,
					Record<string, ContextTransformer>
			  >
			? AtomicResolveConfig<
					TAtomicStateConfig,
					TStateConfig['context'] extends Record<string, ContextTransformer>
						? TStateConfig['context']
						: {}
			  >
			: TStateConfig['children'][child];
	};
}

export type StateConfigToContext<TStateConfig extends StateConfig> = {
	[key in keyof TStateConfig['context']]: TStateConfig['context'][key] extends ContextTransformer
		? ReturnType<TStateConfig['context'][key]>
		: never;
};

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
