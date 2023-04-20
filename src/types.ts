import type { Action } from './action.js';
import { AtomicState } from './atomic';
import type { BaseState } from './base.js';
import type { CompoundState } from './compound';
import type { Condition } from './condition.js';

export type ActionConfig<T extends BaseState> = {
	name?: string,
	notifyAfter?: boolean;
	notifyBefore?: boolean;
	run: (this: T, arg: any) => any;
}

export type ConditionConfig<T extends BaseState> = {
   name?: string,
   notifyAfter?: boolean;
   notifyBefore?: boolean;
   run: (this: T, arg: any) => boolean;
}

type BaseHandler<T extends string> = {
	type: T;
	handler: (args: any[]) => void;
	condition: Condition;
}

export type AlwaysHandler = BaseHandler<'always'>;
export type DispatchHandler = BaseHandler<'dispatch'>;
export type EntryHandler = BaseHandler<'entry'>;
export type ExitHandler = BaseHandler<'exit'>;
export type InitHandler = BaseHandler<'init'>;
export type Handler = AlwaysHandler
 | DispatchHandler
 | EntryHandler
 | ExitHandler
 | InitHandler;

export type AlwaysHandlerConfig = {
	actions?: string[];
	condition?: string;
	transitionTo?: string;
}
export type DispatchHandlerConfig = {
	actions?: string[];
	condition?: string;
	transitionTo?: string;
}
export type EntryHandlerConfig = {
	actions?: string[];
	condition?: string;
}
export type ExitHandlerConfig = {
	actions?: string[];
	condition?: string;
}
export type HandlerConfig = AlwaysHandlerConfig
 | DispatchHandlerConfig
 | EntryHandlerConfig
 | ExitHandlerConfig

export type StateNode = AtomicState | CompoundState;

type StateNodeConfig<T extends BaseState> = {
	actionConfig: Partial<Omit<ActionConfig<T>, 'run'>>;
	actions: Record<string, Action<T>>;
	always: AlwaysHandlerConfig[];
	conditionConfig: Partial<Omit<ConditionConfig<T>, 'run'>>;
	conditions: Record<string, Condition<T>>;
	entry: EntryHandlerConfig[],
	exit: ExitHandlerConfig[],
	name: string;
	on: Record<string, DispatchHandlerConfig[]>;
};

export type AtomicStateConfig = Partial<StateNodeConfig<AtomicState>>;
export type CompoundStateConfig = Partial<StateNodeConfig<CompoundState>> & {
	states: Record<string, StateNode>
};

export type AtomicStateJSON = {
	name: string;
	type: 'atomic',
}

export type CompoundStateJSON = {
	name: string;
	states: Record<string, StateNodeJSON>;
	type: 'compound',
}

export type StateNodeJSON = AtomicStateJSON | CompoundStateJSON;

export {};