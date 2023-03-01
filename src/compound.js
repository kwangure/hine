import { STATE_CONFIG } from './constants.js';

/**
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
 *         [x: string]: Partial<StateConfig>;
 *     },
 * }} StateConfig
 *
 * @typedef {{
 * 	  actions?: string[];
 * 	  condition?: string;
 * 	  transitionTo?: string;
 * }} AlwaysHandlerConfig
 *
 * @typedef {{
 * 	  actions?: string[];
 * 	  condition?: string;
 * 	  transitionTo?: string;
 * }} DispatchHandlerConfig
 *
 * @typedef {{
 * 	  actions?: string[];
 * 	  condition?: string;
 * }} EntryHandlerConfig
 *
 * @typedef {{
 * 	  actions?: string[];
 * 	  condition?: string;
 * }} ExitHandlerConfig
 *
 * @typedef {AlwaysHandlerConfig | DispatchHandlerConfig | EntryHandlerConfig | ExitHandlerConfig} HandlerConfig
 *
 * @typedef {{
 *     type: 'always';
 *     actions: ((...args: any[]) => any)[];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: CompoundState | null;
 * }} AlwaysHandler
 *
 * @typedef {{
 *     type: 'dispatch';
 *     actions: ((...args: any[]) => any)[];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: CompoundState | null;
 * }} DispatchHandler
 *
 * @typedef {{
 *     type: 'entry';
 *     actions: ((...args: any[]) => any)[];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: null;
 * }} EntryHandler
 *
 * @typedef {{
 *     type: 'exit';
 *     actions: ((...args: any[]) => any)[];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: null;
 * }} ExitHandler
 *
 * @typedef {{
 *     type: 'init';
 *     actions: [];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: CompoundState;
 * }} InitHandler
 *
 * @typedef {AlwaysHandler | DispatchHandler | EntryHandler | ExitHandler | InitHandler} Handler
 *
 * @typedef {{
 *     name: string,
 *     states: {
 *         [x: string]: ESStateJson,
 *     },
 *     transition: {
 *         active: boolean;
 *         from: ESStateJson | undefined,
 *         to: ESStateJson | undefined,
 *     }
 * }} ESStateJson
 */

export class CompoundState {
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
	/** @type {CompoundState | null} */
	#state = null;
	/** @type {Map<string, CompoundState>} */
	#states = new Map();
	/** @type {Set<(arg: this) => any>} */
	#subscribers = new Set();
	#transitionActive = false;
	/** @type {CompoundState | null} */
	#transitionFrom = null;
	/** @type {CompoundState | null} */
	#transitionTo = null;

	/**
	 * @type {StateConfig & {
	 *     siblings: Map<string, CompoundState>
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
	 * @param {Partial<StateConfig>} [config]
	 */
	constructor(config) {
		if (config) {
			this.configure(config);
		}
	}

	#callSubscribers() {
		for (const subscriber of this.#subscribers) {
			subscriber(this);
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
	/** @param {Partial<StateConfig>} stateConfig */
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
		this.#callSubscribers();
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
		const {
			always,
			actions,
			conditions,
			entry,
			exit, name, on, siblings, states,
		} = this[STATE_CONFIG];
		this.#name = name;

		for (const name in states) {
			if (Object.hasOwn(states, name)) {
				const state = new CompoundState();
				const config = states[name];
				state.configure({
					name,
					...config,
					actions: {
						...actions,
						...config.actions,
					},
					conditions: {
						...conditions,
						...config.conditions,
					},
				});
				this.#states.set(name, state);
				state[STATE_CONFIG].siblings = this.#states;
			}
		}

		for (const handler of always) {
			this.#always.push({
				actions: resolveActions(actions, handler),
				condition: resolveCondition(conditions, handler),
				transitionTo: resolveTransition(siblings, handler),
				type: 'always',
			});
		}

		for (const [event, handlers] of Object.entries(on)) {
			this.#on[event] = handlers.map((handler) => ({
				actions: resolveActions(actions, handler),
				condition: resolveCondition(conditions, handler),
				transitionTo: resolveTransition(siblings, handler),
				type: 'dispatch',
			}));
		}

		for (const handler of entry) {
			this.#entry.push({
				actions: resolveActions(actions, handler),
				condition: resolveCondition(conditions, handler),
				transitionTo: null,
				type: 'entry',
			});
		}

		for (const handler of exit) {
			this.#exit.push({
				actions: resolveActions(actions, handler),
				condition: resolveCondition(conditions, handler),
				transitionTo: null,
				type: 'exit',
			});
		}

		for (const state of this.#states.values()) {
			state.resolve();
		}

		const iteratorResult = this.#states.values().next();
		// Has at least one nested state
		if (!iteratorResult.done) {
			this.#executeHandlers([{
				actions: [],
				condition: () => true,
				transitionTo: iteratorResult.value,
				type: 'init',
			}]);
		}
	}
	get state() {
		return this.#state;
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.#subscribers.add(fn);
		return () => {
			this.#subscribers.delete(fn);
		};
	}
	/** @returns {ESStateJson} */
	toJSON() {
		/** @type {ESStateJson['states']} */
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

/**
 * @param {NonNullable<StateConfig['actions']>} config
 * @param {Partial<HandlerConfig>} handler
 */
function resolveActions(config, handler) {
	const actions = [];
	for (const name of handler.actions || []) {
		const action = config[name];
		if (!action) {
			throw Error(`State references unknown action '${name}'.`);
		}
		actions.push(action);
	}
	return actions;
}

/**
 * @param {NonNullable<StateConfig['conditions']>} config
 * @param {Partial<HandlerConfig>} handler
 */
function resolveCondition(config, handler) {
	if (handler.condition === undefined) {
		return () => true;
	}
	const condition = config[handler.condition];
	if (!condition) {
		throw Error(`State references unknown condition '${handler.condition}'.`);
	}
	return condition;
}

/**
 * @param {Map<string, CompoundState>} config
 * @param {Partial<AlwaysHandlerConfig | DispatchHandlerConfig>} handler
 */
function resolveTransition(config, handler) {
	const { transitionTo } = handler;
	if (transitionTo) {
		const state = config.get(transitionTo);
		if (!state) {
			throw Error(`Unknown sibling state '${handler.transitionTo}'.`);
		}
		return state;
	}
	return null;
}

