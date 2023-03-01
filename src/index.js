import { CompoundState } from './compound.js';

/**
 * @param {import('./compound.js').StateConfig} config
 */
export function state(config) {
	const compound = new CompoundState();
	if (config) {
		compound.configure(config);
	}
	return compound;
}

export { CompoundState as SingleState };
