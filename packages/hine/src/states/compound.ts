import type {
	ParentStateConfig,
	StateEventListener,
	StateNode,
	StateNodeConfig,
} from './types.js';
import { createListenerMap } from '../utils/normalizeListener.js';

export interface CompoundStateConfig extends ParentStateConfig {
	initial: string;
}

/**
 * Unlike parallel states, where all children are active, compound states can
 * have at most one active child.
 *
 * This function serves as a factory for creating compound states, providing a
 * way to encapsulate their configuration and behaviors, similar to how parallel
 * states are created.
 *
 * @param name The unique name of the compound state. This name is used to
 *             identify and refer to the state within the state machine.
 * @param config The configuration object for the compound state.
 */
export function compound(name: string, config: CompoundStateConfig) {
	const hooks = createListenerMap(config?.hooks);
	const listeners = createListenerMap(config?.on);
	return [
		CompoundState,
		[
			name,
			listeners,
			hooks,
			config.children.map((state) => [state[1][0], state] as const) ?? [],
			config.initial,
		],
	] satisfies [
		typeof CompoundState,
		[
			string,
			Map<string, StateEventListener[]>,
			Map<string, StateEventListener[]>,
			[string, StateNodeConfig<StateNode>][],
			string,
		],
	];
}

export class CompoundState implements StateNode {
	#children = new Map();
	#current;
	#hooks;
	#listeners;
	#name;
	constructor(
		name: string,
		listeners: Map<string, StateEventListener[]>,
		hooks: Map<string, StateEventListener[]>,
		children: [string, StateNode][],
		current: string,
	) {
		this.#current = current;
		this.#children = new Map(children);
		this.#hooks = hooks;
		this.#listeners = listeners;
		this.#name = name;
	}
	get activeChildren() {
		const state = this.#children.get(this.#current);
		if (!state) {
			let message = `'${this.#current}' is not a child of '${this.#name}' state.`;
			const childNames = [...this.#children.keys()];
			message +=
				childNames.length === 1
					? ` Expected child '${childNames[0]}'.`
					: ` Expected one of the children: '${childNames.join(
							"', '",
					  )}'.`;
			throw Error(message);
		}
		return [state] as [StateNode];
	}
	get children() {
		return this.#children;
	}
	get hooks() {
		return this.#hooks;
	}
	get listeners() {
		return this.#listeners;
	}
	get name() {
		return this.#name;
	}
	__goto(newState: string, path: string[]) {
		if (!this.#children.has(newState)) {
			throw Error(
				`TransitionError: State '${newState}' is not a child of '${path.join(
					'.',
				)}'.`,
			);
		}
		this.#current = newState;
	}
	get type() {
		return 'compound' as const;
	}
}
