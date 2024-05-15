import type { StateEvent } from './event/event.js';

export interface StateNode {
	activeChildren: [string, StateNode][];
	children: Map<string, StateNode>;
	hooks: Map<string, EventListener[]>;
	listeners: Map<string, EventListener[]>;
	name: string;
	transitionTo(newState: string, path: string[]): void;
}

export type StateNodeConfig<T extends StateNode> = [
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	{ new (...args: any[]): T },
	[
		string,
		[string, EventListener[]][],
		[string, EventListener[]][],
		[string, StateNodeConfig<StateNode>][]?,
		string?,
	],
];

export interface If {
	(event: StateEvent): boolean;
}

export interface Run {
	(event: StateEvent): unknown;
}

export interface BaseEventListener {
	if?: If;
	run?: Run;
}

export interface EventListener extends BaseEventListener {
	goto?: string;
}

export interface BaseStateConfig {
	hooks?: {
		afterEntry?: Run | BaseEventListener | (Run | BaseEventListener)[];
		beforeExit?: Run | BaseEventListener | (Run | BaseEventListener)[];
	};
	on?: Record<
		string,
		string | Run | EventListener | (string | Run | EventListener)[]
	>;
}
export interface AtomicStateConfig extends BaseStateConfig {}

export interface ParentStateConfig extends BaseStateConfig {
	children: StateNodeConfig<StateNode>[];
}
export interface CompoundStateConfig extends ParentStateConfig {
	initial: string;
}
export interface ParallelStateConfig extends ParentStateConfig {}
