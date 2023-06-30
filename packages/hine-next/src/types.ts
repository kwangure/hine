import { Action } from './runtime/action.js';

export interface ActionConfig {
	run: (this: undefined, arg: Action) => any;
}

export type EntryHandlerConfig = {
	actions: string[];
};

export type HandlerConfig = {
	actions: Action[];
	name: string;
};

export type MonitorConfig = {
	actions: Record<string, Action>;
	entry: EntryHandlerConfig[];
};

export {};
