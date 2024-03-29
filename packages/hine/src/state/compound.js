import { ParentState } from './parent.js';

/**
 * `compound` creates an `CompoundState` instance.
 *
 * @template {string} TName - A string type representing the name of the state.
 * @template {import('./types.js').CompoundStateConfig<TName>} TConfig - The configuration type for the compound state, defining its structure and behavior.
 * @param {TConfig} config - Configuration object for the compound state.
 */
export function compound(config) {
	return /** @type {CompoundState<TConfig, {}>} */ (new CompoundState(config));
}

/**
 * `CompoundState` is a specialized type of state in a state machine tree.
 * It can contain nested states, including both atomic states and other compound
 * states, allowing for the representation of complex state hierarchies and
 * behaviors within the state machine.
 *
 * The class extends `ParentState`, inheriting its properties and methods, and
 * emphasizes the ability to contain and manage a hierarchy of nested states. `CompoundState` is particularly useful for modeling scenarios where states have multiple levels of nested substates.
 *
 * @template {import('./types.js').StateConfig} TStateConfig Configuration defining the structure and behavior of compound states.
 * @template {Record<string, any>} TContextAncestor A `Record` type representing the context data of ancestor nodes of the compound state.
 * @extends {ParentState<TStateConfig, TContextAncestor>}
 */
export class CompoundState extends ParentState {
	#type = /** @type {const} */ ('compound');

	/**
	 * @param {TStateConfig} stateConfig
	 */
	constructor(stateConfig) {
		super(stateConfig);
	}
	/**
	 * @param {Record<string, import("./types.js").StateNode>} [children]
	 */
	__append(children) {
		super.__append(children);
		if (this.__state) return;
		if (!this.__children.size) return;
		const iterator = this.__children.values();
		const first = iterator.next();
		this.__initial = first.value;
		this.__state = first.value;
		this.__state.__queueEntryHandlers();
	}
	__callSubscribers() {
		this.__state?.__callSubscribers();
		super.__callSubscribers();
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
		this.__state = this.__initial;
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

		for (const state of this.__children.values()) {
			state.__resolveConfig();
		}
	}
	/** @param {import('./types.js').RequireContext<TStateConfig, import('./types.js').ParentResolveConfig<TContextAncestor, this>>} [config] */
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
	 * @param {string} target
	 * @param {(() => any)[]} actions
	 */
	__transition(target, actions) {
		const from = this.__state;
		const to = this.__children.get(target);
		// These should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');
		if (!to) {
			let message = '';
			if (this.path.some((segment) => Boolean(segment))) {
				const path = this.path.join('.');
				message += `State '${path}' references unknown transition target '${to}'.`;
			} else {
				message += `State references unknown transition target '${to}'.`;
			}
			const siblings = Array.from(this.__children.keys());
			if (siblings.length) {
				message += ` Expected one of: ${siblings.join(', ')}.`;
			}
			throw Error(message);
		}

		from.__handlerQueue.length = 0;
		// exit actions for the current state
		from.__queueExitHandlers();
		from.__executeHandlersLeafFirst();

		// transition actions for the handler
		for (const action of actions) {
			action();
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
		if (name in this.__onHandler && this.__onHandler[name].length) return true;
		if (this.__state?.isActiveEvent(name)) return true;
		return false;
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		if (!this.__initialized) return false;
		if (super.matches(path)) return true;

		return (
			path.startsWith(`${this.name}.`) &&
			Boolean(this.__state?.matches(path.slice(this.name.length + 1)))
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
	get type() {
		return this.#type;
	}
}
