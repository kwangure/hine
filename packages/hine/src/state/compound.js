import { BaseState } from './base.js';

/**
 * @typedef {import('../state/types.js').StateNode} StateNode
 */

export class CompoundState extends BaseState {
	/** @type {StateNode | null} */
	#initial = null;
	#type = /** @type {const} */ ('compound');
	/** @type {Map<string, StateNode>} */
	__children = new Map();
	/** @type {StateNode | null} */
	__state = null;
	/**
	 * @param {import('./types.js').CompoundStateConfig} stateConfig
	 */
	constructor(stateConfig) {
		super(stateConfig);

		const missingError = Error('Compound states require at least one child');
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
		// No state, implies the machine is not intialized, return zero events
		if (!this.__state) return;

		for (const [name, handlers] of Object.entries(this.__onHandler)) {
			if (handlers.length) {
				stateTreeEvents.add(name);
			}
		}

		this.__state.__nextEvents(stateTreeEvents);
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
				"Attempted to call 'state.isActiveEvent()' before calling 'state.start()'",
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
		if (!this.__state) return false;

		return (
			super.matches(path) ||
			(path.startsWith(`${this.name}.`) &&
				this.__state.matches(path.slice(this.name.length + 1)))
		);
	}
	/** @param {import('../types.js').CompoundMonitorConfig} config */
	monitor(config) {
		super.monitor(config);
		if (!config?.children) return;
		for (const [name, monitorConfig] of Object.entries(config.children)) {
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
			state.monitor(monitorConfig);
		}
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.__subscribers.add(/** @type {(arg: BaseState) => any} */ (fn));
		return () => {
			this.__subscribers.delete(/** @type {(arg: BaseState) => any} */ (fn));
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
