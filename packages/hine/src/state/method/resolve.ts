import { StateEvent } from '../event/event.js';
import type { StateNode, StateNodeConfig } from '../types.js';
import { runEntryHooks } from './emit.js';

export function resolveState<T extends StateNode>(
	config: StateNodeConfig<T>,
): T {
	const state = __resolveState(config);
	const event = new StateEvent('afterEntry', state, undefined);
	runEntryHooks(state, event);
	return state;
}

function __resolveState<T extends StateNode>(config: StateNodeConfig<T>): T {
	const [StateNode, args] = config;
	const [name, listeners, hooks, children, initial] = args;
	const resolvedChildren = children?.map(
		([name, childConfig]) =>
			[name, __resolveState(childConfig)] satisfies [string, StateNode],
	);
	const state = new StateNode(
		name,
		listeners,
		hooks,
		resolvedChildren,
		initial,
	);
	return state;
}
