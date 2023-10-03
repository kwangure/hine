import { BaseState } from './base.js';

/**
 * @template {import('./types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {BaseState<TStateConfig, TContextAncestor>}
 */
export class ParentState extends BaseState {
	/** @type {Map<string, import('./types.js').StateNode>} */
	__children = new Map();

	/**
	 * @param {TStateConfig} stateConfig
	 */
	constructor(stateConfig) {
		super(stateConfig);

		const missingError = Error('Parent states require at least one child');
		if (!stateConfig.children) throw missingError;

		const children = Object.entries(stateConfig.children);
		if (!children.length) throw missingError;

		for (const [name, state] of children) {
			if (!state.name) {
				state.__name = name;
			}
			this.__children.set(state.name, state);
			state.__parent = this;
		}
	}
	/**
	 * This is a noop for `ParallelState`s and implemented for `CompoundState`s
	 *
	 * @param {import("./types.js").StateNode} _to
	 * @param {import("../runner/action.js").ActionRunner<any, any>[]} _actions
	 */
	__transition(_to, _actions) {}
	/** @param {import('./types.js').RequireContext<TStateConfig, import('./types.js').ParentResolveConfig<TStateConfig, TContextAncestor>>} [config] */
	resolve(config) {
		this.__resolve(config);
		this.__start();
	}
	/** @param {import('./types.js').RequireContext<TStateConfig, import('./types.js').ParentResolveConfig<TStateConfig, TContextAncestor>>} [config] */
	__resolve(config) {
		super.__resolve(config);
		if (!config?.children) return;
		for (const [name, resolveConfig] of Object.entries(config.children)) {
			const state = this.__children.get(name);
			if (!state) {
				const parentPath = this.parent?.path || [];
				const pathString = parentPath.length
					? `${parentPath.join('.')}.${name}`
					: name;
				throw Error(
					`State '${pathString}' defined on monitor does not exist in state tree. Expected one of: ${[
						...this.__children.keys(),
					].join(', ')}`,
				);
			}
			state.__resolve(resolveConfig);
		}
	}
}
