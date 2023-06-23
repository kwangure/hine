import type { Action } from './action.js';
import type { Handler } from './handler.js';
import type { AtomicState } from './atomic';
import type { BaseState } from './handler.js';
import type { CompoundState } from './compound';
import type { Condition } from './condition.js';
import type { TO_JSON } from './constants.js';
import type { Simplify } from 'type-fest';

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

export type HandlerConfig<T extends StateNode> = {
	actions?: Action[];
	condition?: Condition;
	name: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
	ownerState?: T | BaseState;
	transitionTo?: T;
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
	actionConfig: Partial<Omit<ActionConfig, 'run'>>;
	always: AlwaysHandlerConfig[];
	conditionConfig: Partial<Omit<ConditionConfig, 'run'>>;
	conditions: Record<string, Condition>;
	name: string;
	on: Record<string, DispatchHandlerConfig[]>;
};

export type AtomicStateConfig = Partial<StateNodeConfig>;
export type CompoundStateConfig = Partial<StateNodeConfig> & {
	states: Record<string, StateNode>;
};

type BaseJSON = ReturnType<BaseState[typeof TO_JSON]>;

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
export type HandlerJSON = ReturnType<Handler['toJSON']>;

export type MonitorConfig = {
	actions?: Record<string, Action>;
	entry?: EntryHandlerConfig[];
	exit?: ExitHandlerConfig[];
}

export type CompoundMonitorConfig = MonitorConfig & {
	states?: Record<string, MonitorConfig | CompoundMonitorConfig>;
}

export {};
