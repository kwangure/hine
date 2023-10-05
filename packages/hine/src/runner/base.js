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
	/**
	 * @param {import('../state/base.js').BaseState<TStateConfig, TContextAncestor>} ownerState
	 */
	constructor(ownerState) {
		this.__ownerState = ownerState;
	}
	get context() {
		return this.__ownerState.context;
	}
	get event() {
		return this.__ownerState.event;
	}
	get ownerState() {
		return this.__ownerState;
	}
}
