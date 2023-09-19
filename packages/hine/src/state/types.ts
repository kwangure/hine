import type {
	ActionRunnerConfig,
	BaseRunnerConfig,
	ConditionRunnerConfig,
} from '../runner/types.js';
import type { AtomicState } from './atomic.js';
import type { CompoundState } from './compound.js';
import type { EffectHandler } from '../handler/effect.js';
import type { TransitionHandler } from '../handler/transition.js';
import type { HandlerJSON } from '../handler/types.js';

export type StateNode = AtomicState | CompoundState;

export interface BaseStateConfig {
	always?: (EffectHandler | TransitionHandler)[];
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
	actions?: Record<string, ActionRunnerConfig | ActionRunnerConfig['run']>;
	actionConfig?: BaseRunnerConfig;
	conditions?: Record<
		string,
		ConditionRunnerConfig | ConditionRunnerConfig['run']
	>;
	conditionConfig?: BaseRunnerConfig;
	context?: Record<string, unknown>;
}

export interface AtomicResolveConfig extends BaseResolveConfig {}

export interface CompoundResolveConfig extends BaseResolveConfig {
	children?: Record<string, AtomicResolveConfig | CompoundResolveConfig>;
}

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
