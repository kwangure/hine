import { ParentState } from './parent.js';

/**
 * @template {string} TName
 * @template {import('./types.js').ParallelStateConfig<TName>} TConfig
 * @param {TConfig} [config]
 */
export function parallel(config) {
	return /** @type {ParallelState<TConfig, {}>} */ (
		// @ts-ignore
		new ParallelState(config ?? /** @type {TConfig} */ ({}))
	);
}

/**
 * @template {import('./types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 * @extends {ParentState<TStateConfig, TContextAncestor>}
 */
export class ParallelState extends ParentState {
	#type = /** @type {const} */ ('parallel');

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
		if (!children) return;
		for (const child of Object.values(children)) {
			child.__queueEntryHandlers();
		}
	}
	__callSubscribers() {
		for (const child of this.__children.values()) {
			child.__callSubscribers();
		}
		super.__callSubscribers();
	}
	__executeHandlersLeafFirst() {
		for (const child of this.__children.values()) {
			child.__executeHandlersLeafFirst();
		}
		super.__executeHandlersLeafFirst();
	}
	__executeHandlersRootFirst() {
		super.__executeHandlersRootFirst();
		for (const child of this.__children.values()) {
			child?.__executeHandlersRootFirst();
		}
	}
	/** @param {Set<string>} stateTreeEvents */
	__nextEvents(stateTreeEvents) {
		if (!this.__initialized) return;

		for (const [name, handlers] of Object.entries(this.__onHandler)) {
			if (handlers.length) {
				stateTreeEvents.add(name);
			}
		}

		for (const child of this.__children.values()) {
			child.__nextEvents(stateTreeEvents);
		}
	}
	__queueAlwaysHandlers() {
		for (const child of this.__children.values()) {
			child.__queueAlwaysHandlers();
		}
		super.__queueAlwaysHandlers();
	}
	__queueEntryHandlers() {
		super.__queueEntryHandlers();
		for (const child of this.__children.values()) {
			child.__queueEntryHandlers();
		}
	}
	__queueExitHandlers() {
		for (const child of this.__children.values()) {
			child.__queueExitHandlers();
		}
		super.__queueExitHandlers();
	}
	/**
	 * @param {string} eventName
	 */
	__queueOnHandlers(eventName) {
		for (const child of this.__children.values()) {
			child.__queueOnHandlers(eventName);
		}
		super.__queueOnHandlers(eventName);
	}
	__resolveConfig() {
		super.__resolveConfig();

		for (const state of this.__children.values()) {
			state.__resolveConfig();
		}
	}
	/**
	 * @param {string} path
	 * @returns {boolean}
	 */
	canTransitionTo(path) {
		if (super.canTransitionTo(path)) return true;
		if (!path.startsWith(`${this.name}.`)) return false;

		const restPath = path.slice(this.name.length + 1); // add 1 to account for the dot in `${this.name}.`
		for (const child of this.__children.values()) {
			if (child.canTransitionTo(restPath)) return true;
		}

		return false;
	}
	/** @param {string} name */
	isActiveEvent(name) {
		if (name in this.__onHandler && this.__onHandler[name].length) return true;
		for (const child of this.__children.values()) {
			if (child.isActiveEvent(name)) return true;
		}
		return false;
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		if (!this.__initialized) return false;

		if (super.matches(path)) return true;
		if (!path.startsWith(`${this.name}.`)) return false;

		const restPath = path.slice(this.name.length + 1); // add 1 to account for the dot in `${this.name}.`
		for (const child of this.__children.values()) {
			if (child.matches(restPath)) return true;
		}

		return false;
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
