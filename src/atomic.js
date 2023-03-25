import {
	INITIALIZE,
	RESOLVE_CONFIG,
	RUN_ALWAYS_HANDLERS,
	RUN_ENTRY_HANDLERS,
	RUN_EXIT_HANDLERS,
	RUN_ON_HANDLERS,
	STATE_ACTIONS,
	STATE_ACTIVE,
	STATE_CONDITIONS,
	STATE_NAME,
	STATE_PARENT,
	STATE_STATES,
} from './constants.js';

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
 * @typedef {import('./types.js').Handler} Handler
 *
 * @typedef {{
 *     actions: Record<string, (this: AtomicState, ...args: any[]) => any>;
 *     always: AlwaysHandlerConfig[],
 *     conditions: Record<string, (this: AtomicState, ...args: any[]) => boolean>;
 *     entry: EntryHandlerConfig[],
 *     exit: ExitHandlerConfig[],
 *     name: string;
 *     on: Record<string, DispatchHandlerConfig[]>;
 * }} AtomicStateConfig
 *
 * @typedef {import('./compound.js').CompoundState} CompoundState
 */
export class AtomicState {
	/** @type {AtomicStateConfig['actions']} */
	#actionConfig = {};
	/** @type {AlwaysHandler[]} */
	#always = [];
	/** @type {AlwaysHandlerConfig[]} */
	#alwaysConfig = [];
	/** @type {AtomicStateConfig['conditions']} */
	#conditionConfig = {};
	/** @type {EntryHandler[]} */
	#entry = [];
	/** @type {EntryHandlerConfig[]} */
	#entryConfig = [];
	/** @type {ExitHandler[]} */
	#exit = [];
	/** @type {ExitHandlerConfig[]} */
	#exitConfig = [];
	/** @type {boolean} */
	#initialized = false;
	/** @type {string} */
	#name = '';
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};

	/** @type {AtomicStateConfig['on']} */
	#onConfig = {};
	/** @type {CompoundState | null} */
	#parent = null;
	/** @type {Set<(arg: this) => any>} */
	#subscribers = new Set();

	/**
	 * @param {Partial<AtomicStateConfig>} [stateConfig]
	 */
	constructor(stateConfig) {
		if (!stateConfig) return;
		this.#actionConfig = stateConfig.actions || {};
		this.#alwaysConfig = stateConfig.always || [];
		this.#conditionConfig = stateConfig.conditions || {};
		this.#entryConfig = stateConfig.entry || [];
		this.#exitConfig = stateConfig.exit || [];
		this.#name = stateConfig.name || '';
		this.#onConfig = stateConfig.on || {};
	}
	#callSubscribers() {
		for (const subscriber of this.#subscribers) {
			subscriber(this);
		}
	}
	/**
	 * @param {Handler[]} handlers
	 * @param {any[]} args
	 */
	#executeHandlers(handlers, args) {
		for (const { condition, handler } of handlers) {
			if (!condition.call(this, ...args)) continue;
			const transitioned = handler(args);
			if (transitioned) return;
		}
	}
	/**
	 * @param {Partial<HandlerConfig>} handler
	 */
	#resolveActions(handler) {
		const actions = [];
		for (const name of handler.actions || []) {
			const action = this[STATE_ACTIONS][name];
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
	#resolveCondition(handler) {
		if (handler.condition === undefined) {
			return () => true;
		}
		const condition = this[STATE_CONDITIONS][handler.condition];
		if (!condition) {
			throw Error(`State references unknown condition '${handler.condition}'.`);
		}
		return condition;
	}
	/**
	 * @param {Partial<AlwaysHandlerConfig | DispatchHandlerConfig>} handler
	 */
	#resolveHandler(handler) {
		const { transitionTo } = handler;
		const actions = this.#resolveActions(handler);
		if (transitionTo) {
			const parent = this.#parent;
			if (!parent) {
				throw Error('States without a parent cannot transition');
			}
			const to = parent[STATE_STATES].get(transitionTo);
			if (!to) {
				throw Error(`Unknown sibling state '${transitionTo}'.`);
			}
			const from = this;

			/** @param {any[]} args */
			return (args) => {
				// exit actions for the current state
				from[RUN_EXIT_HANDLERS](args);
				// transition actions for the handler
				for (const action of actions) {
					action.call(from, ...args);
				}
				// change the active nested state for parent state
				parent[STATE_ACTIVE] = to;
				// set initial state from transitionTo to leaves
				to[INITIALIZE]();
				// entry actions for transitionTo and leaves
				to[RUN_ENTRY_HANDLERS]([]);
				// always actions for transitionTo and leaves
				to[RUN_ALWAYS_HANDLERS]([]);

				return true;
			};
		}

		/** @param {any[]} args */
		return (args) => {
			for (const action of actions) {
				action.call(this, ...args);
			}
			return false;
		};
	}
	/**
	 * @param {string} event
	 * @param {any[]} value
	 */
	dispatch(event, ...value) {
		if (!this.#initialized) {
			throw Error('Attempted dispatch before resolving state');
		}
		this[RUN_ON_HANDLERS](event, value);
		this.#callSubscribers();
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		return this.#initialized && this.#name === path;
	}
	get name() {
		return this.#name;
	}
	start() {
		this[RESOLVE_CONFIG]();
		this[INITIALIZE]();
		this[RUN_ENTRY_HANDLERS]([]);
		this[RUN_ALWAYS_HANDLERS]([]);
		this.#callSubscribers();

		return this;
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.#subscribers.add(fn);
		return () => {
			this.#subscribers.delete(fn);
		};
	}
	toJSON() {
		return {
			name: this.name,
		};
	}
	[INITIALIZE]() {
		this.#initialized = true;
	}
	[RESOLVE_CONFIG]() {
		for (const handler of this.#alwaysConfig) {
			this.#always.push({
				condition: this.#resolveCondition(handler),
				handler: this.#resolveHandler(handler),
				type: 'always',
			});
		}

		for (const [event, handlers] of Object.entries(this.#onConfig)) {
			this.#on[event] = handlers.map((handler) => ({
				condition: this.#resolveCondition(handler),
				handler: this.#resolveHandler(handler),
				type: 'dispatch',
			}));
		}

		for (const handler of this.#entryConfig) {
			this.#entry.push({
				condition: this.#resolveCondition(handler),
				handler: this.#resolveHandler({
					...handler,
					transitionTo: undefined,
				}),
				type: 'entry',
			});
		}

		for (const handler of this.#exitConfig) {
			this.#exit.push({
				condition: this.#resolveCondition(handler),
				handler: this.#resolveHandler({
					...handler,
					transitionTo: undefined,
				}),
				type: 'exit',
			});
		}
	}
	/** @param {any[]} value */
	[RUN_ALWAYS_HANDLERS](value) {
		this.#executeHandlers(this.#always, value);
	}
	/** @param {any[]} value */
	[RUN_ENTRY_HANDLERS](value) {
		this.#executeHandlers(this.#entry, value);
	}
	/** @param {any[]} value */
	[RUN_EXIT_HANDLERS](value) {
		this.#executeHandlers(this.#exit, value);
	}
	/**
	 * @param {string} event
	 * @param {any[]} value
	 */
	[RUN_ON_HANDLERS](event, value) {
		const handlers = [];
		if (Object.hasOwn(this.#on, event)) {
			handlers.push(...this.#on[event]);
		}
		handlers.push(...this.#always);
		return this.#executeHandlers(handlers, value);
	}
	/**
	 * @returns {Record<string, (...args: any[]) => any>}
	 */
	get [STATE_ACTIONS]() {
		const actions = this.#parent?.[STATE_ACTIONS] || {};
		for (const name in this.#actionConfig) {
			if (Object.hasOwn(this.#actionConfig, name)) {
				actions[name] = this.#actionConfig[name].bind(this);
			}
		}

		return actions;
	}
	/**
	 * @returns {Record<string, (...args: any[]) => boolean>}
	 */
	get [STATE_CONDITIONS]() {
		const conditions = this.#parent?.[STATE_CONDITIONS] || {};
		for (const name in this.#conditionConfig) {
			if (Object.hasOwn(this.#conditionConfig, name)) {
				conditions[name] = this.#conditionConfig[name]
					.bind(this);
			}
		}

		return conditions;
	}
	/** @param {string} value */
	set [STATE_NAME](value) {
		this.#name = value;
	}
	get [STATE_PARENT]() {
		return this.#parent;
	}
	set [STATE_PARENT](value) {
		this.#parent = value;
	}
}
