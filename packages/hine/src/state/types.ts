import type { StateEvent } from './event/event.js';

export interface StateNode {
	activeChildren: StateNode[];
	children: Map<string, StateNode>;
	hooks: Map<string, StateEventListener[]>;
	listeners: Map<string, StateEventListener[]>;
	name: string;
	__goto(newState: string, path: string[]): void;
}

export type StateNodeConfig<T extends StateNode> = [
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	{ new (...args: any[]): T },
	[
		string,
		Map<string, StateEventListener[]>,
		Map<string, StateEventListener[]>,
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

export interface StateEventListener extends BaseEventListener {
	goto?: string;
}

export interface BaseStateConfig {
	hooks?: {
		afterEntry?: Run | BaseEventListener | (Run | BaseEventListener)[];
		beforeExit?: Run | BaseEventListener | (Run | BaseEventListener)[];
	};
	on?: Record<
		string,
		| string
		| Run
		| StateEventListener
		| (string | Run | StateEventListener)[]
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
