import type {
	CompoundStateConfig,
	EventListener,
	StateNode,
	StateNodeConfig,
} from './types.js';
import { normalizeListeners } from './util.js';

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
	const hooks = normalizeListeners(config?.hooks);
	const listeners = normalizeListeners(config?.on);
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
			[string, EventListener[]][],
			[string, EventListener[]][],
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
		listeners: [string, EventListener[]][],
		hooks: [string, EventListener[]][],
		children: [string, StateNode][],
		current: string,
	) {
		this.#current = current;
		this.#children = new Map(children);
		this.#hooks = new Map(hooks);
		this.#listeners = new Map(listeners);
		this.#name = name;
	}
	get activeStates() {
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
		return [[this.#current, state]] as [[string, StateNode]];
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
	transitionTo(newState: string, path: string[]) {
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
