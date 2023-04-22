import type { Action } from './action.js';
import { AtomicState } from './atomic';
import type { BaseState } from './handler.js';
import type { CompoundState } from './compound';
import type { Condition } from './condition.js';

export type ActionConfig<T extends StateNode> = {
	name?: string,
	notifyAfter?: boolean;
	notifyBefore?: boolean;
	run: (this: T, arg: any) => any;
}

export type ConditionConfig<T extends StateNode> = {
	name?: string,
	notifyAfter?: boolean;
	notifyBefore?: boolean;
	run: (this: T, arg: any) => boolean;
}

export type HandlerConfig<T extends StateNode> = {
	actions: Action[];
	condition: Condition | null;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
	ownerState: T | BaseState;
	transitionTo: T | null;
}

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

export type StateNode = AtomicState | CompoundState;

type StateNodeConfig<T extends StateNode> = {
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

export { };