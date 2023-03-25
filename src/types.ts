import type { AtomicState } from "./atomic";
import type { CompoundState } from "./compound";

type Condition = (...args: any[]) => boolean;

type BaseHandler<T extends string> = {
	type: T;
	handler: (args: any[]) => boolean;
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

export {};