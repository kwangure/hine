import {
	EXECUTE_HANDLERS_LEAF_FIRST,
	EXECUTE_HANDLERS_ROOT_FIRST,
	INITIALIZE,
	QUEUE_ALWAYS_HANDLERS,
	QUEUE_ENTRY_HANDLERS,
	QUEUE_EXIT_HANDLERS,
	QUEUE_ON_HANDLERS,
	RESOLVE_CONFIG,
	STATE_ACTIVE,
	STATE_NAME,
	STATE_PARENT,
	STATE_STATES,
	STATE_SUBSCRIBERS,
	TO_JSON,
} from './constants.js';
import { BaseState } from './base.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 */

export class CompoundState extends BaseState {
	/** @type {StateNode | null} */
	#initial = null;
	/** @type {StateNode | null} */
	#state = null;
	/** @type {Map<string, StateNode>} */
	#states = new Map();
	#type = /** @type {const} */('compound');

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
				state[STATE_NAME] = name;
			}
			this.#states.set(state.name, state);
			state[STATE_PARENT] = this;
		}
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		if (!this.#state) return false;
		return path === this.name
			|| (path.startsWith(`${this.name}.`)
				&& this.#state
					.matches(path.slice(this.name.length + 1)));
	}
	get state() {
		return this.#state;
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this[STATE_SUBSCRIBERS].add(/** @type {(arg: BaseState) => any} */(fn));
		return () => {
			this[STATE_SUBSCRIBERS].delete(/** @type {(arg: BaseState) => any} */(fn));
		};
	}
	toJSON() {
		/** @type {Record<string, import('./types').StateNodeJSON>} */
		const states = {};
		for (const [name, state] of this.#states) {
			states[name] = state.toJSON();
		}
		const baseJSON = super[TO_JSON]();

		return {
			type: this.#type,
			...baseJSON,
			states,
		};
	}
	get type() {
		return this.#type;
	}
	/**
	 * @param {any} value
	 */
	[EXECUTE_HANDLERS_LEAF_FIRST](value) {
		this.state?.[EXECUTE_HANDLERS_LEAF_FIRST](value);
		super[EXECUTE_HANDLERS_LEAF_FIRST](value);
	}
	/**
	 * @param {any} value
	 */
	[EXECUTE_HANDLERS_ROOT_FIRST](value) {
		super[EXECUTE_HANDLERS_ROOT_FIRST](value);
		this.state?.[EXECUTE_HANDLERS_ROOT_FIRST](value);
	}
	[INITIALIZE]() {
		this.#state = this.#initial;
		this.#state?.[INITIALIZE]();
		super[INITIALIZE]();
	}
	[QUEUE_ALWAYS_HANDLERS]() {
		this.#state?.[QUEUE_ALWAYS_HANDLERS]();
		super[QUEUE_ALWAYS_HANDLERS]();
	}
	[QUEUE_ENTRY_HANDLERS]() {
		super[QUEUE_ENTRY_HANDLERS]();
		this.#state?.[QUEUE_ENTRY_HANDLERS]();
	}
	[QUEUE_EXIT_HANDLERS]() {
		this.#state?.[QUEUE_EXIT_HANDLERS]();
		super[QUEUE_EXIT_HANDLERS]();
	}
	/**
	 * @param {string} event
	 */
	[QUEUE_ON_HANDLERS](event) {
		this.#state?.[QUEUE_ON_HANDLERS](event);
		super[QUEUE_ON_HANDLERS](event);
	}
	[RESOLVE_CONFIG]() {
		super[RESOLVE_CONFIG]();
		const iterator = this.#states.values();
		const first = iterator.next();
		// We know `first` is not empty but TypeScript doesn't. Help it.
		if (first.done) throw Error('Impossible!');
		this.#initial = first.value;

		for (const state of this.#states.values()) {
			state[RESOLVE_CONFIG]();
		}
	}
	/** @param {StateNode} value */
	set [STATE_ACTIVE](value) {
		this.#state = value;
	}
	get [STATE_STATES]() {
		return this.#states;
	}
}
