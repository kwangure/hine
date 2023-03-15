import {
	RUN_ALWAYS_HANDLERS,
	RUN_ENTRY_HANDLERS,
	RUN_EXIT_HANDLERS,
	RUN_ON_HANDLERS,
	SET_INITIAL_STATE,
	STATE_CALL_SUBSCRIBERS,
	STATE_CONFIG,
} from './constants.js';
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
 *    actions: {
 *         [x: string]: (this: StateNode, ...args: any[]) => any,
 *     };
 *    conditions: {
 *         [x: string]: (this: StateNode, ...args: any[]) => boolean,
 *     };
 * }} ResolveCompoundStateConfig
 *
 * @typedef {{
 *     name: string,
 *     states: {
 *         [x: string]: StateJson,
 *     },
 * }} CompoundStateJson
 */

export class CompoundState extends BaseState {
	/** @type {AlwaysHandler[]} */
	#always = [];
	/** @type {EntryHandler[]} */
	#entry = [];
	/** @type {ExitHandler[]} */
	#exit = [];
	/** @type {StateNode | null} */
	#initial = null;
	/** @type {string} */
	#name = '';
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};
	/** @type {StateNode | null} */
	#state = null;
	/** @type {Map<string, StateNode>} */
	#states = new Map();

	/**
	 * @type {CompoundStateConfig & {
	 *     siblings: Map<string, StateNode>
	 * }}
	 */
	[STATE_CONFIG] = {
		name: '',
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
			if (!condition.call(this, ...args)) continue;
			if (transitionTo) {
				return {
					transitionTo,
					runActions: this.#runActions.bind(this, actions, args),
				};
			}
			this.#runActions(actions, args);
		}
		return null;
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
	 * @param {any[]} value
	 */
	dispatch(event, ...value) {
		if (!this.#state) {
			throw Error('Attempted dispatch before resolving state');
		}
		this[RUN_ON_HANDLERS](event, value);
		this[STATE_CALL_SUBSCRIBERS]();
	}
	get entry() {
		return this.#entry;
	}
	get exit() {
		return this.#exit;
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		if (!this.#state) return false;
		return path === this.#name
			|| (path.startsWith(`${this.#name}.`)
				&& this.#state.matches(path.slice(this.#name.length + 1)));
	}
	get name() {
		return this.#name;
	}
	get on() {
		return this.#on;
	}
	/** @param {Partial<ResolveCompoundStateConfig>} [fallbackConfig] */
	resolve(fallbackConfig) {
		const { always, entry, exit, name, on, states } = this[STATE_CONFIG];

		this[STATE_CONFIG].actions = {
			...fallbackConfig?.actions,
			...this[STATE_CONFIG].actions,
		};
		this[STATE_CONFIG].conditions = {
			...fallbackConfig?.conditions,
			...this[STATE_CONFIG].conditions,
		};
		this.#name = name || '';

		for (const name in states) {
			if (Object.hasOwn(states, name)) {
				const state = states[name];
				if (state[STATE_CONFIG].name) {
					this.#states.set(state[STATE_CONFIG].name, state);
				} else {
					state.configure({ name });
					this.#states.set(name, state);
				}
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

		const iterator = this.#states.values();
		const first = iterator.next();
		// If has no elements
		if (first.done) {
			throw Error('Compound states require at least one child');
		}

		this.#initial = first.value;
		for (const [name, state] of this.#states) {
			/** @type {ResolveCompoundStateConfig['actions']} */
			const actions = {};
			for (const name in this[STATE_CONFIG].actions) {
				if (Object.hasOwn(this[STATE_CONFIG].actions, name)) {
					actions[name] = this[STATE_CONFIG].actions[name].bind(this);
				}
			}
			/** @type {ResolveCompoundStateConfig['conditions']} */
			const conditions = {};
			for (const name in this[STATE_CONFIG].conditions) {
				if (Object.hasOwn(this[STATE_CONFIG].conditions, name)) {
					conditions[name] = this[STATE_CONFIG]
						.conditions[name].bind(this);
				}
			}
			state.resolve({ actions, conditions, name });
		}

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
	start() {
		this[SET_INITIAL_STATE]();
		this[RUN_ENTRY_HANDLERS]([]);
		this[RUN_ALWAYS_HANDLERS]([]);
		this[STATE_CALL_SUBSCRIBERS]();

		return this;
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
		};
	}
	/** @param {any[]} value */
	[RUN_ALWAYS_HANDLERS](value) {
		this.#executeHandlers(this.#always, ...value);
		this.#state?.[RUN_ALWAYS_HANDLERS](value);
	}
	/**
	 * Batch entry and always actions but bail if any transition happens.
	 *
	 * @param {any[]} value
	 */
	[RUN_ENTRY_HANDLERS](value) {
		this.#executeHandlers(this.#entry, ...value);
		this.#state?.[RUN_ENTRY_HANDLERS](value);
	}
	/**
	 * Execute exit actions but bail if any transition happens.
	 *
	 * @param {any[]} value
	 */
	[RUN_EXIT_HANDLERS](value) {
		this.#state?.[RUN_EXIT_HANDLERS](value);
		return this.#executeHandlers(this.#exit, ...value);
	}
	/**
	 * @param {string} event
	 * @param {any[]} value
	 */
	[RUN_ON_HANDLERS](event, value) {
		const transitionHandler = this.#state?.[RUN_ON_HANDLERS](event, value);
		if (transitionHandler) {
			const { transitionTo, runActions } = transitionHandler;
			// exit actions for the current state
			this.#state?.[RUN_EXIT_HANDLERS](value);
			// transition actions for the handler
			runActions();
			// change the active nested state for this state
			this.#state = transitionTo;
			// set initial state from transitionTo to leaves
			transitionTo[SET_INITIAL_STATE]();
			// entry actions for transitionTo and leaves
			transitionTo[RUN_ENTRY_HANDLERS]([]);
			// always actions for transitionTo and leaves
			// TODO: Handle transitions
			transitionTo[RUN_ALWAYS_HANDLERS]([]);
		}
		const handlers = [];
		if (Object.hasOwn(this.#on, event)) {
			handlers.push(...this.#on[event]);
		}
		handlers.push(...this.#always);
		return this.#executeHandlers(handlers, ...value);
	}
	[SET_INITIAL_STATE]() {
		this.#state = this.#initial;
		this.#state?.[SET_INITIAL_STATE]();
	}
}
