import type { Action } from './action.js';
import type { AtomicState } from './atomic';
import type { BaseState } from './base.js';
import type { CompoundState } from './compound';
import type { Condition } from './condition.js';
import type { Context } from './context.js';
import type { EffectHandler2 } from './handler/effect.js';
import type { Simplify } from 'type-fest';
import type { TransitionHandler } from './handler/transition.js';

interface RunnerConfig {
	name?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
}

export interface ActionConfig extends RunnerConfig {
	run: (this: undefined, arg: Action) => any;
}

export interface ConditionConfig extends RunnerConfig {
	run: (this: undefined, arg: Condition) => boolean;
}

export interface BaseHandlerConfig {
	run?: string[];
	if?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
}

export interface EffectHandlerConfig extends BaseHandlerConfig {
	run: string[];
}

export interface TransitionHandlerConfig extends BaseHandlerConfig {
	goto: string;
}

export interface BaseStateConfig {
	always?: (EffectHandler2 | TransitionHandler)[];
	context?: Context;
	entry?: EffectHandler2[];
	exit?: EffectHandler2[];
	name?: string;
	on?: Record<string, (EffectHandler2 | TransitionHandler)[]>;
}

export interface AtomicStateConfig extends BaseStateConfig {}

export interface CompoundStateConfig extends BaseStateConfig {
	children: Record<string, StateNode>;
}

type BaseJSON = ReturnType<BaseState['__toJSON']>;

export type AtomicStateJSON = Simplify<
	BaseJSON & {
		type: 'atomic';
	}
>;

export type CompoundStateJSON = Simplify<
	BaseJSON & {
		type: 'compound';
		states: Record<string, StateNodeJSON>;
	}
>;

export type StateNodeJSON = AtomicStateJSON | CompoundStateJSON;

export type ActionJSON = ReturnType<Action['toJSON']>;
export type ConditionJSON = ReturnType<Condition['toJSON']>;
export type HandlerJSON = ReturnType<
	(EffectHandler2 | TransitionHandler)['toJSON']
>;

export interface BaseMonitorConfig {
	actions?: Record<string, Action>;
	actionConfig?: RunnerConfig;
	conditions?: Record<string, Condition>;
	conditionConfig?: RunnerConfig;
}

export interface AtomicMonitorConfig extends BaseMonitorConfig {}

export interface CompoundMonitorConfig extends BaseMonitorConfig {
	states?: Record<string, AtomicMonitorConfig | CompoundMonitorConfig>;
}

export interface EventOptions {
	name: string;
	value?: string;
}

export type StateNode = AtomicState | CompoundState;

export {};
