import type { StateNode } from '../types.js';

export function matches(state: StateNode, path: string) {
	if (state.name === path) return true;

	const pathPrefix = state.name + '.';
	if (!path.startsWith(pathPrefix)) return false;

	const restPath = path.slice(pathPrefix.length);
	for (const activeChild of state.activeChildren) {
		if (matches(activeChild, restPath)) return true;
	}

	return false;
}
