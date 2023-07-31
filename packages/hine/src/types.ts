import type { Action } from './action.js';
import type { AtomicState } from './atomic';
import type { BaseState } from './base.js';
import type { CompoundState } from './compound';
import type { Condition } from './condition.js';
import type { Context } from './context.js';
import type { EffectHandler2 } from './handler/effect.js';
import type { Simplify } from 'type-fest';
import type { TransitionHandler } from './handler/transition.js';

export interface ActionConfig {
	name?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
	run: (this: undefined, arg: Action) => any;
}

export interface ConditionConfig {
	name?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
	run: (this: undefined, arg: Condition) => boolean;
}

export type EffectHandlerConfig = {
	run?: string[];
	if?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
};

export type TransitionHandlerConfig = {
	run?: string[];
	if?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
	goto: string;
};

export type AlwaysHandlerConfig = {
	actions?: string[];
	condition?: string;
	transitionTo?: string;
};
export type DispatchHandlerConfig = {
	actions?: string[];
	condition?: string;
	transitionTo?: string;
};
export type EntryHandlerConfig = {
	actions?: string[];
	condition?: string;
};
export type ExitHandlerConfig = {
	actions?: string[];
	condition?: string;
};

export type StateNode = AtomicState | CompoundState;

type StateNodeConfig = {
	always: (EffectHandler2 | TransitionHandler)[];
	context: Context;
	entry: EffectHandler2[];
	exit: EffectHandler2[];
	name: string;
	on: Record<string, (EffectHandler2 | TransitionHandler)[]>;
};

export type AtomicStateConfig = Partial<StateNodeConfig>;
export type CompoundStateConfig = Partial<StateNodeConfig> & {
	states: Record<string, StateNode>;
};

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

export type MonitorConfig = {
	actions?: Record<string, Action>;
	actionConfig?: Partial<Omit<ActionConfig, 'run'>>;
	conditions?: Record<string, Condition>;
	conditionConfig?: Partial<Omit<ConditionConfig, 'run'>>;
};

export type CompoundMonitorConfig = MonitorConfig & {
	states?: Record<string, MonitorConfig | CompoundMonitorConfig>;
};

export type EventOptions = {
	name: string;
	value?: string;
};

export {};
