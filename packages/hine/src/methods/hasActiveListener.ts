import type { StateNode } from '../states/types.js';

export function hasActiveListener(state: StateNode, event: string) {
	if (state.listeners.has(event)) return true;

	for (const activeChild of state.activeChildren) {
		if (hasActiveListener(activeChild, event)) return true;
	}

	return false;
}
