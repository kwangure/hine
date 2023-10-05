/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 */
export class BaseRunner {
	// TODO: Capture correct __ownerState using generics.
	// Ideally, instead of using `BaseState` we should get the exact state the user
	// provided and wire it down to here using generics. e.g (AtomicState<..., ...>)
	// This would mean that TypeScript can guide the user on class methods e.g. `appendChild`
	// which should only be available on `ParentState` but not `AtomicState`. However,
	// I was not able to do this on my first attempt. It results in a TypeScript infinite
	// type error because of recursively defined types.
	// The workaround is to implement all methods in child classes of `BaseState` in `BaseState`,
	// but as a noop. This unfortuately means a user might reach for a method their state class
	// doesn't support.
	/** @type {import('../state/base.js').BaseState<TStateConfig, TContextAncestor>} */
	__ownerState;
	__name = '';
	/**
	 * @param {import('./types.js').BaseRunnerConfig & {
	 *     ownerState: import('../state/base.js').BaseState<TStateConfig, TContextAncestor>
	 * }} options
	 */
	constructor(options) {
		this.__name = options.name || '';
		this.__ownerState = options.ownerState;
	}
	get context() {
		return this.__ownerState.context;
	}
	get event() {
		return this.__ownerState.event;
	}
	get name() {
		return this.__name;
	}
	get ownerState() {
		return this.__ownerState;
	}
}
