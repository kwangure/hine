import { BaseState } from './base.js';
import { RESOLVE_CONFIG } from './constants.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 */

// @ts-expect-error
export class CompoundState extends BaseState {
	/** @type {StateNode | null} */
	#initial = null;
	#type = /** @type {const} */ ('compound');
	/**
	 * @private
	 * @type {Map<string, StateNode>}
	 */
	__states = new Map();
	/**
	 * @private
	 * @type {StateNode | null}
	 */
	__state = null;
	/**
	 * @param {import('./types').CompoundStateConfig} stateConfig
	 */
	constructor(stateConfig) {
		super(stateConfig);

		const missingError = Error('Compound states require at least one child');
		if (!stateConfig.states) throw missingError;

		const states = Object.entries(stateConfig.states);
		if (!states.length) throw missingError;

		for (const [name, state] of states) {
			if (!state.name) {
				// @ts-expect-error
				state.__name = name;
			}
			this.__states.set(state.name, state);
			// @ts-expect-error
			state.__parent = this;
		}
	}
	/** @private */
	__executeHandlersLeafFirst() {
		// @ts-expect-error
		this.state?.__executeHandlersLeafFirst();
		// @ts-expect-error
		super.__executeHandlersLeafFirst();
	}
	/** @private */
	__executeHandlersRootFirst() {
		// @ts-expect-error
		super.__executeHandlersRootFirst();
		// @ts-expect-error
		this.state?.__executeHandlersRootFirst();
	}
	__initialize() {
		this.__state = this.#initial;
		for (const state of this.__states.values()) {
			// @ts-expect-error
			state.__initialize();
		}
		// @ts-expect-error
		super.__initialize();
	}
	/**
	 * @private
	 * @param {Set<string>} stateTreeEvents
	 */
	__nextEvents(stateTreeEvents) {
		// No state, implies the machine is not intialized, return zero events
		if (!this.__state) return;

		// @ts-expect-error
		for (const [name, handlers] of Object.entries(this.__onHandler)) {
			if (handlers.length) {
				stateTreeEvents.add(name);
			}
		}

		// @ts-expect-error
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
		// @ts-expect-error
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
	/** @param {import('./types.js').CompoundMonitorConfig} config */
	monitor(config) {
		super.monitor(config);
		if (!config?.states) return;
		for (const [name, monitorConfig] of Object.entries(config.states)) {
			const state = this.__states.get(name);
			if (!state) {
				const parentPath = this.parent?.path || [];
				const pathString = parentPath.length
					? `${parentPath.join('.')}.${name}`
					: name;
				throw Error(
					`State '${pathString}' defined on monitor does not exist in state tree. Expected one of: ${[
						...this.__states.keys(),
					].join(', ')}`,
				);
			}
			state.monitor(monitorConfig);
		}
	}
	get state() {
		return this.__state;
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		// @ts-expect-error
		this.__subscribers.add(/** @type {(arg: BaseState) => any} */ (fn));
		return () => {
			// @ts-expect-error
			this.__subscribers.delete(/** @type {(arg: BaseState) => any} */ (fn));
		};
	}
	toJSON() {
		/** @type {Record<string, import('./types').StateNodeJSON>} */
		const states = {};
		for (const [name, state] of this.__states) {
			states[name] = state.toJSON();
		}

		return {
			type: this.#type,
			...super.__toJSON(),
			states,
		};
	}
	get type() {
		return this.#type;
	}
	[RESOLVE_CONFIG]() {
		super[RESOLVE_CONFIG]();
		const iterator = this.__states.values();
		const first = iterator.next();
		// We know `first` is not empty but TypeScript doesn't. Help it.
		if (first.done) throw Error('Impossible!');
		this.#initial = first.value;

		for (const state of this.__states.values()) {
			state[RESOLVE_CONFIG]();
		}
	}
}
