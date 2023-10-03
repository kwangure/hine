import { ParentState } from './parent.js';

/**
 * @template {import('./types.js').CompoundStateConfig} TConfig
 * @param {TConfig} config
 */
export function compound(config) {
	return /** @type {CompoundState<TConfig, {}>} */ (new CompoundState(config));
}

/**
 * @template {import('./types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {ParentState<TStateConfig, TContextAncestor>}
 */
export class CompoundState extends ParentState {
	/** @type {import('./types.js').StateNode | null} */
	#initial = null;
	#type = /** @type {const} */ ('compound');

	/** @type {import('./types.js').StateNode | null} */
	__state = null;
	/**
	 * @param {TStateConfig} stateConfig
	 */
	constructor(stateConfig) {
		super(stateConfig);
	}
	__executeHandlersLeafFirst() {
		this.__state?.__executeHandlersLeafFirst();
		super.__executeHandlersLeafFirst();
	}
	__executeHandlersRootFirst() {
		super.__executeHandlersRootFirst();
		this.__state?.__executeHandlersRootFirst();
	}
	__initialize() {
		this.__state = this.#initial;
		for (const state of this.__children.values()) {
			state.__initialize();
		}
		super.__initialize();
	}
	/** @param {Set<string>} stateTreeEvents */
	__nextEvents(stateTreeEvents) {
		if (!this.__initialized) return;

		for (const [name, handlers] of Object.entries(this.__onHandler)) {
			if (handlers.length) {
				stateTreeEvents.add(name);
			}
		}

		this.__state?.__nextEvents(stateTreeEvents);
	}
	__queueAlwaysHandlers() {
		this.__state?.__queueAlwaysHandlers();
		super.__queueAlwaysHandlers();
	}
	__queueEntryHandlers() {
		super.__queueEntryHandlers();
		this.__state?.__queueEntryHandlers();
	}
	__queueExitHandlers() {
		this.__state?.__queueExitHandlers();
		super.__queueExitHandlers();
	}
	/**
	 * @param {string} eventName
	 */
	__queueOnHandlers(eventName) {
		this.__state?.__queueOnHandlers(eventName);
		super.__queueOnHandlers(eventName);
	}
	__resolveConfig() {
		super.__resolveConfig();
		const iterator = this.__children.values();
		const first = iterator.next();
		// We know `first` is not empty but TypeScript doesn't. Help it.
		if (first.done) throw Error('Impossible!');
		this.#initial = first.value;

		for (const state of this.__children.values()) {
			state.__resolveConfig();
		}
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
	/**
	 * @param {import("./types.js").StateNode} to
	 * @param {import("../runner/action.js").ActionRunner<any, any>[]} actions
	 */
	__transition(to, actions) {
		const from = this.__state;
		// These should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');

		from.__handlerQueue.length = 0;
		// exit actions for the current state
		from.__queueExitHandlers();
		from.__executeHandlersLeafFirst();

		// transition actions for the handler
		for (const action of actions) {
			action.run();
		}
		// This should never happen. They're mostly to help TypeScript out
		if (!from.parent) throw Error('Missing state parent');
		// change the active nested state for parent state
		this.__state = to;
		// set initial state from transitionTo to leaves
		to.__initialize();

		to.__queueEntryHandlers();
		to.__executeHandlersRootFirst();
		to.__queueAlwaysHandlers();
		to.__executeHandlersRootFirst();
	}
	/**
	 * @param {string} path
	 * @returns {boolean}
	 */
	canTransitionTo(path) {
		return (
			super.canTransitionTo(path) ||
			(path.startsWith(`${this.name}.`) &&
				Boolean(
					this.__state?.canTransitionTo(path.slice(this.name.length + 1)),
				))
		);
	}
	/** @param {string} name */
	isActiveEvent(name) {
		// No active child state implies state is not initialized
		if (!this.__state) {
			throw Error(
				"Attempted to call 'state.isActiveEvent()' before calling 'state.resolve()'",
			);
		}
		if (name in this.__onHandler && this.__onHandler[name].length) return true;
		if (this.__state.isActiveEvent(name)) return true;
		return false;
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		if (!this.__initialized) return false;

		return (
			super.matches(path) ||
			(path.startsWith(`${this.name}.`) &&
				Boolean(this.__state?.matches(path.slice(this.name.length + 1))))
		);
	}

	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.__subscribers.add(
			/** @type {(arg: import('./base.js').BaseState<TStateConfig, TContextAncestor>) => any} */ (
				fn
			),
		);
		return () => {
			this.__subscribers.delete(
				/** @type {(arg: import('./base.js').BaseState<TStateConfig, TContextAncestor>) => any} */ (
					fn
				),
			);
		};
	}
	toJSON() {
		/** @type {Record<string, import('./types.js').StateNodeJSON>} */
		const children = {};
		for (const [name, state] of this.__children) {
			children[name] = state.toJSON();
		}

		return {
			type: this.#type,
			...super.__toJSON(),
			children,
		};
	}
	get type() {
		return this.#type;
	}
}
