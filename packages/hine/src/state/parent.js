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

		this.__append(stateConfig.children);
	}
	/**
	 * @param {Record<string, import("./types.js").StateNode> | undefined} children
	 */
	__append(children) {
		if (!children) return;

		const __children = Object.entries(children);
		for (const [name, state] of __children) {
			if (!state.name) {
				state.__name = name;
			}
			this.__children.set(state.name, state);
			state.__parent = this;
		}
	}
	/**
	 * @template {Record<string, import("./types.js").StateNode>} TChildren
	 * @param {TChildren} children
	 * @param {NonNullable<import('./types.js').RequireContext<import('./types.js').ReplaceChildren<TStateConfig, TChildren>, import('./types.js').ParentResolveConfig<import('./types.js').ReplaceChildren<TStateConfig, TChildren>, TContextAncestor>>['children']>} resolveConfig
	 */
	append(children, resolveConfig) {
		this.__append(children);
		for (const [name, config] of Object.entries(resolveConfig)) {
			const state = children[name];
			if (!state) {
				const parentPath = this.parent?.path || [];
				const pathString = parentPath.length
					? `${parentPath.join('.')}.${name}`
					: name;
				throw Error(
					`Resolve state '${pathString}' defined does not exist in state tree. Expected one of: ${[
						...Object.keys(children),
					].join(', ')}`,
				);
			}
			state.__resolve(config);
		}
	}
	/**
	 * This is a noop for `ParallelState`s and implemented for `CompoundState`s
	 *
	 * @param {string} _to
	 * @param {import("../runner/base.js").BaseRunner<any, any>[]} _actions
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
