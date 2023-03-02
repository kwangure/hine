import type { AtomicState, AtomicStateJson } from "./atomic";
import type { CompoundState, CompoundStateJson } from "./compound";

type Action = (...args: any[]) => any;
type Condition = (...args: any[]) => boolean;

type BaseHandler<T extends string, TransitionTo> = {
	type: T;
	actions: Action[];
	condition: Condition;
	transitionTo: TransitionTo;
}

export type AlwaysHandler = BaseHandler<'always', StateNode | null>;
export type DispatchHandler = BaseHandler<'dispatch', StateNode | null>;
export type EntryHandler = BaseHandler<'entry', null>;
export type ExitHandler = BaseHandler<'exit', null>;
export type InitHandler = BaseHandler<'init', StateNode>;
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
export type StateJson = AtomicStateJson | CompoundStateJson

export {};