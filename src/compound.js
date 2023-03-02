import { STATE_CALL_SUBSCRIBERS, STATE_CONFIG } from './constants.js';
import { BaseState } from './base.js';

/**
 * @typedef {import('./types.js').AlwaysHandlerConfig} AlwaysHandlerConfig
 * @typedef {import('./types.js').DispatchHandlerConfig} DispatchHandlerConfig
 * @typedef {import('./types.js').EntryHandlerConfig} EntryHandlerConfig
 * @typedef {import('./types.js').ExitHandlerConfig} ExitHandlerConfig
 * @typedef {import('./types.js').HandlerConfig} HandlerConfig
 *
 * @typedef {import('./types.js').AlwaysHandler} AlwaysHandler
 * @typedef {import('./types.js').DispatchHandler} DispatchHandler
 * @typedef {import('./types.js').EntryHandler} EntryHandler
 * @typedef {import('./types.js').ExitHandler} ExitHandler
 * @typedef {import('./types.js').InitHandler} InitHandler
 * @typedef {import('./types.js').Handler} Handler
 *
 * @typedef {import('./types.js').StateNode} StateNode
 * @typedef {import('./types.js').StateJson} StateJson
 *
 * @typedef {{
 *     actions: {
 *         [x: string]: (this: CompoundState, ...args: any[]) => any,
 *     }
 *     always: AlwaysHandlerConfig[],
 *     conditions: {
 *         [x: string]: (this: CompoundState, ...args: any[]) => boolean,
 *     }
 *     entry: EntryHandlerConfig[],
 *     exit: ExitHandlerConfig[],
 *     name: string;
 *     on: {
 *         [x: string]: DispatchHandlerConfig[];
 *     };
 *     states: {
 *         [x: string]: StateNode;
 *     },
 * }} CompoundStateConfig
 *
 * @typedef {{
 *     name: string,
 *     states: {
 *         [x: string]: StateJson,
 *     },
 *     transition: {
 *         active: boolean;
 *         from: StateJson | undefined,
 *         to: StateJson | undefined,
 *     }
 * }} CompoundStateJson
 */

export class CompoundState extends BaseState {
	/** @type {AlwaysHandler[]} */
	#always = [];
	/** @type {EntryHandler[]} */
	#entry = [];
	/** @type {ExitHandler[]} */
	#exit = [];
	/** @type {string} */
	#name = '';
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};
	/** @type {StateNode | null} */
	#state = null;
	/** @type {Map<string, StateNode>} */
	#states = new Map();
	#transitionActive = false;
	/** @type {StateNode | null} */
	#transitionFrom = null;
	/** @type {StateNode | null} */
	#transitionTo = null;

	/**
	 * @type {CompoundStateConfig & {
	 *     siblings: Map<string, StateNode>
	 * }}
	 */
	[STATE_CONFIG] = {
		name: 'state',
		actions: {},
		always: [],
		conditions: {},
		entry: [],
		exit: [],
		on: {},
		states: {},
		siblings: new Map(),
	};

	/**
	 * @param {Partial<CompoundStateConfig>} [config]
	 */
	constructor(config) {
		super();
		if (config) {
			this.configure(config);
		}
	}

	/**
	 * @param {Handler[]} handlers
	 * @param {...any} args
	 */
	#executeHandlers(handlers, ...args) {
		for (const { actions, condition, transitionTo } of handlers) {
			if (!condition.call(this, ...args)) {
				continue;
			}
			if (transitionTo) {
				this.#transitionFrom = this.#state;
				this.#transitionTo = transitionTo;
				this.#transitionActive = true;

				// exit actions for the current state
				if (this.#state?.exit) {
					this.#executeHandlers(this.#state.exit, ...args);
				}
				// transition actions for the current handler
				this.#runActions(actions, args);
				// change the active nested state for this state
				this.#state = transitionTo;
				// entry actions for the next state
				this.#executeHandlers(transitionTo.entry, ...args);
				// transient actions for the next state
				this.#executeHandlers(transitionTo.always, ...args);
				// mark transition as completed
				this.#transitionActive = false;
				break;
			}

			this.#runActions(actions, args);
		}
	}
	/**
	 * @param {((...args: any) => any)[]} actions
	 * @param {any[]} args
	 */
	#runActions(actions, args) {
		for (const action of actions) {
			action.call(this, ...args);
		}
	}
	get always() {
		return this.#always;
	}
	/** @param {Partial<CompoundStateConfig>} stateConfig */
	configure(stateConfig) {
		const config = this[STATE_CONFIG];
		config.name = stateConfig.name || config.name;

		Object.assign(config.actions, stateConfig.actions);
		Object.assign(config.conditions, stateConfig.conditions);
		Object.assign(config.on, stateConfig.on);
		Object.assign(config.states, stateConfig.states);

		if (stateConfig.always) config.always = stateConfig.always;
		if (stateConfig.entry) config.entry = stateConfig.entry;
		if (stateConfig.exit) config.exit = stateConfig.exit;

		return this;
	}
	/**
	 * @param {string} event
	 * @param {...any} value
	 */
	dispatch(event, ...value) {
		if (!this.#state) return;
		const handlers = [];
		if (Object.hasOwn(this.#state.on, event)) {
			handlers.push(...this.#state.on[event]);
		}
		handlers.push(...this.#state.always);
		this.#executeHandlers(handlers, ...value);
		this[STATE_CALL_SUBSCRIBERS]();
	}
	get entry() {
		return this.#entry;
	}
	get exit() {
		return this.#exit;
	}
	get name() {
		return this.#name;
	}
	get on() {
		return this.#on;
	}
	resolve() {
		const { always, entry, exit, name, on, states } = this[STATE_CONFIG];
		this.#name = name;

		for (const name in states) {
			if (Object.hasOwn(states, name)) {
				const state = states[name];
				state.configure({ name });
				this.#states.set(name, state);
				state[STATE_CONFIG].siblings = this.#states;
			}
		}

		for (const handler of always) {
			this.#always.push({
				actions: this.resolveActions(handler),
				condition: this.resolveCondition(handler),
				transitionTo: this.resolveTransition(handler),
				type: 'always',
			});
		}

		for (const [event, handlers] of Object.entries(on)) {
			this.#on[event] = handlers.map((handler) => ({
				actions: this.resolveActions(handler),
				condition: this.resolveCondition(handler),
				transitionTo: this.resolveTransition(handler),
				type: 'dispatch',
			}));
		}

		for (const handler of entry) {
			this.#entry.push({
				actions: this.resolveActions(handler),
				condition: this.resolveCondition(handler),
				transitionTo: null,
				type: 'entry',
			});
		}

		for (const handler of exit) {
			this.#exit.push({
				actions: this.resolveActions(handler),
				condition: this.resolveCondition(handler),
				transitionTo: null,
				type: 'exit',
			});
		}

		for (const state of this.#states.values()) {
			state.resolve();
		}

		const iteratorResult = this.#states.values().next();
		// Has at least one nested state
		if (iteratorResult.done) {
			throw Error('Compound states require at least one child');
		}
		this.#executeHandlers([{
			actions: [],
			condition: () => true,
			transitionTo: iteratorResult.value,
			type: 'init',
		}]);

		return this;
	}
	/**
	 * @param {Partial<HandlerConfig>} handler
	 */
	resolveActions(handler) {
		const actions = [];
		for (const name of handler.actions || []) {
			const action = this[STATE_CONFIG].actions[name];
			if (!action) {
				throw Error(`State references unknown action '${name}'.`);
			}
			actions.push(action);
		}
		return actions;
	}

	/**
	 * @param {Partial<HandlerConfig>} handler
	 */
	resolveCondition(handler) {
		if (handler.condition === undefined) {
			return () => true;
		}
		const condition = this[STATE_CONFIG].conditions[handler.condition];
		if (!condition) {
			throw Error(`State references unknown condition '${handler.condition}'.`);
		}
		return condition;
	}
	/**
	 * @param {Partial<AlwaysHandlerConfig | DispatchHandlerConfig>} handler
	 */
	resolveTransition(handler) {
		const { transitionTo } = handler;
		if (transitionTo) {
			const state = this[STATE_CONFIG].siblings.get(transitionTo);
			if (!state) {
				throw Error(`Unknown sibling state '${handler.transitionTo}'.`);
			}
			return state;
		}
		return null;
	}
	get state() {
		return this.#state;
	}
	/** @returns {CompoundStateJson} */
	toJSON() {
		/** @type {CompoundStateJson['states']} */
		const states = {};

		for (const [name, state] of this.#states) {
			states[name] = state.toJSON();
		}

		return {
			name: this.name,
			states,
			transition: {
				active: this.#transitionActive,
				from: this.#transitionFrom?.toJSON(),
				to: this.#transitionTo?.toJSON(),
			},
		};
	}
	get transition() {
		return {
			active: this.#transitionActive,
			from: this.#transitionFrom,
			to: this.#transitionTo,
		};
	}
}
