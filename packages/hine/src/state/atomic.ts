import type { AtomicStateConfig, EventListener, StateNode } from './types.js';
import { normalizeListeners } from './util.js';

/**
 * Atomic states are the most basic state type. They do not contain any child
 * states, making them the leaf nodes in the state hierarchy.
 *
 * This function is a factory for creating such states, encapsulating their
 * configuration and behaviors.
 *
 * @param name The unique name of the state. This name is used to identify
 *             and refer to the state within the state machine.
 * @param config The configuration object for the atomic state.
 */
export function atomic(name: string, config?: AtomicStateConfig) {
	const hooks = normalizeListeners(config?.hooks);
	const listeners = normalizeListeners(config?.on);
	return [AtomicState, [name, listeners, hooks]] satisfies [
		typeof AtomicState,
		[string, [string, EventListener[]][], [string, EventListener[]][]],
	];
}

export class AtomicState implements StateNode {
	#children = new Map() as Map<never, never>;
	#hooks;
	#listeners;
	#name;
	constructor(
		name: string,
		listeners: [string, EventListener[]][],
		hooks: [string, EventListener[]][],
	) {
		this.#hooks = new Map(hooks);
		this.#listeners = new Map(listeners);
		this.#name = name;
	}
	get activeStates() {
		return [];
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
		throw Error(
			`TransitionError: Attempted to transition to '${newState}' in '${path.join(
				'.',
			)}'. Atpmic state should not have children cannot.`,
		);
	}
	get type() {
		return 'atomic' as const;
	}
}
