import {
	INITIALIZE,
	RESOLVE_CONFIG,
	RUN_ALWAYS_HANDLERS,
	RUN_ENTRY_HANDLERS,
	RUN_EXIT_HANDLERS,
	RUN_ON_HANDLERS,
	STATE_ACTIVE,
	STATE_NAME,
	STATE_PARENT,
	STATE_STATES,
} from './constants.js';
import { AtomicState } from './index.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 */

export class CompoundState extends AtomicState {
	/** @type {StateNode | null} */
	#initial = null;
	/** @type {StateNode | null} */
	#state = null;
	/** @type {Map<string, StateNode>} */
	#states = new Map();

	/**
	 * @param {import('./types').CompoundStateConfig} [stateConfig]
	 */
	constructor(stateConfig) {
		super(stateConfig);
		if (!stateConfig) return;

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
	/**
	 * @returns {import('./types').CompoundStateJSON}
	 */
	toJSON() {
		/** @type {Record<string, import('./types').StateNodeJSON>} */
		const states = {};
		for (const [name, state] of this.#states) {
			states[name] = state.toJSON();
		}

		return {
			// AtomicStateJSON
			...super.toJSON(),
			states,
		};
	}
	[INITIALIZE]() {
		this.#state = this.#initial;
		this.#state?.[INITIALIZE]();
		super[INITIALIZE]();
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
	/** @param {any[]} value */
	[RUN_ALWAYS_HANDLERS](value) {
		super[RUN_ALWAYS_HANDLERS](value);
		this.#state?.[RUN_ALWAYS_HANDLERS](value);
	}
	/** @param {any[]} value */
	[RUN_ENTRY_HANDLERS](value) {
		super[RUN_ENTRY_HANDLERS](value);
		this.#state?.[RUN_ENTRY_HANDLERS](value);
	}
	/** @param {any[]} value */
	[RUN_EXIT_HANDLERS](value) {
		this.#state?.[RUN_EXIT_HANDLERS](value);
		super[RUN_EXIT_HANDLERS](value);
	}
	/**
	 * @param {string} event
	 * @param {any[]} value
	 */
	[RUN_ON_HANDLERS](event, value) {
		this.#state?.[RUN_ON_HANDLERS](event, value);
		return super[RUN_ON_HANDLERS](event, value);
	}
	/** @param {StateNode} value */
	set [STATE_ACTIVE](value) {
		this.#state = value;
	}
	get [STATE_STATES]() {
		return this.#states;
	}
}
