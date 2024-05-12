import type {
	EventListener,
	ParallelStateConfig,
	StateNode,
	StateNodeConfig,
} from './types.js';
import { normalizeListeners } from './util.js';

/**
 * Unlike compound states, where exactly one child is active, all parallel state
 * children are active at the same time.
 *
 * This function serves as a factory for creating parallel states, providing a
 * way to encapsulate their configuration and behaviors, similar to how compound
 * states are created.
 *
 * @param name The unique name of the parallel state. This name is used to
 *             identify and refer to the state within the state machine.
 * @param config The configuration object for the parallel state.
 */
export function parallel(name: string, config?: ParallelStateConfig) {
	const hooks = normalizeListeners(config?.hooks);
	const listeners = normalizeListeners(config?.on);
	return [
		ParallelState,
		[
			name,
			listeners,
			hooks,
			config?.children.map((state) => [state[1][0], state] as const) ??
				[],
		],
	] satisfies [
		typeof ParallelState,
		[
			string,
			[string, EventListener[]][],
			[string, EventListener[]][],
			[string, StateNodeConfig<StateNode>][],
		],
	];
}

export class ParallelState implements StateNode {
	#children = new Map();
	#hooks;
	#listeners;
	#name;
	constructor(
		name: string,
		listeners: [string, EventListener[]][],
		hooks: [string, EventListener[]][],
		children: [string, StateNode][],
	) {
		this.#children = new Map(children);
		this.#hooks = new Map(hooks);
		this.#listeners = new Map(listeners);
		this.#name = name;
	}
	get activeStates() {
		return Array.from(this.#children);
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
			)}'. Parallel state children cannot transition since all states are active.`,
		);
	}
	get type() {
		return 'parallel' as const;
	}
}
