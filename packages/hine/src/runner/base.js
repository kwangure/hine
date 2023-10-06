/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 */
export class BaseRunner {
	/** @type {(arg: any) => any} */
	#run;
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
	 * @param {(arg: any) => any} run
	 * @param {import('../state/base.js').BaseState<TStateConfig, TContextAncestor>} ownerState
	 */
	constructor(run, ownerState) {
		this.#run = run;
		this.__ownerState = ownerState;
	}
	/**
	 * @param {import('../handler/base.js').BaseHandler<TStateConfig, TContextAncestor>} handler
	 */
	run(handler) {
		return this.#run.call(undefined, handler);
	}
}
