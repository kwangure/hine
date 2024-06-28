import type {
	ParallelStateConfig,
	StateEventListener,
	StateNode,
	StateNodeConfig,
} from './types.js';
import { createListenerMap } from './util.js';

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
	const hooks = createListenerMap(config?.hooks);
	const listeners = createListenerMap(config?.on);
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
			Map<string, StateEventListener[]>,
			Map<string, StateEventListener[]>,
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
		listeners: Map<string, StateEventListener[]>,
		hooks: Map<string, StateEventListener[]>,
		children: [string, StateNode][],
	) {
		this.#children = new Map(children);
		this.#hooks = hooks;
		this.#listeners = listeners;
		this.#name = name;
	}
	get activeChildren() {
		return Array.from(this.#children.values());
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
