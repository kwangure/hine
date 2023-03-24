import {
	RUN_ALWAYS_HANDLERS,
	RUN_ENTRY_HANDLERS,
	RUN_EXIT_HANDLERS,
	RUN_ON_HANDLERS,
	SET_INITIAL_STATE,
	STATE_ACTIONS,
	STATE_ACTIVE,
	STATE_CALL_SUBSCRIBERS,
	STATE_CONDITIONS,
	STATE_CONFIG,
} from './constants.js';
import { BaseState } from './base.js';

/**
 * @typedef {{
 *     actions: {
 *         [x: string]: (this: AtomicState, ...args: any[]) => any,
 *     }
 *     always: AlwaysHandlerConfig[],
 *     conditions: {
 *         [x: string]: (this: AtomicState, ...args: any[]) => boolean,
 *     }
 *     entry: EntryHandlerConfig[],
 *     exit: ExitHandlerConfig[],
 *     name: string;
 *     on: {
 *         [x: string]: DispatchHandlerConfig[];
 *     };
 * }} AtomicStateConfig
 *
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
 *
 * @typedef {{
 *     name: string,
 * }} AtomicStateJson
 */

export class AtomicState extends BaseState {
	/** @type {AlwaysHandler[]} */
	#always = [];
	/** @type {EntryHandler[]} */
	#entry = [];
	/** @type {ExitHandler[]} */
	#exit = [];
	#initialized = false;
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};

	/**
	 * @type {Omit<AtomicStateConfig, 'name'> & {
	 *     parent: import('./compound.js').CompoundState | null;
	 * }}
	 */
	[STATE_CONFIG] = {
		actions: {},
		always: [],
		conditions: {},
		entry: [],
		exit: [],
		on: {},
		parent: null,
	};
	__name = '';

	/**
	 * @param {Partial<AtomicStateConfig>} [stateConfig]
	 */
	constructor(stateConfig) {
		super();
		if (!stateConfig) return;

		this.__name = stateConfig.name || '';
		const config = this[STATE_CONFIG];

		Object.assign(config.actions, stateConfig.actions);
		Object.assign(config.conditions, stateConfig.conditions);
		Object.assign(config.on, stateConfig.on);

		if (stateConfig.always) config.always = stateConfig.always;
		if (stateConfig.entry) config.entry = stateConfig.entry;
		if (stateConfig.exit) config.exit = stateConfig.exit;
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
		const condition = this[STATE_CONFIG].conditions[handler.condition];
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
			const { parent } = this[STATE_CONFIG];
			if (!parent) {
				throw Error('States without a parent cannot transition');
			}
			const to = parent[STATE_CONFIG].states[transitionTo];
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
				to[SET_INITIAL_STATE]();
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
		this[STATE_CALL_SUBSCRIBERS]();
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		return this.#initialized && this.__name === path;
	}
	get name() {
		return this.__name;
	}
	resolve() {
		const { always, entry, exit, on } = this[STATE_CONFIG];

		for (const handler of always) {
			this.#always.push({
				condition: this.#resolveCondition(handler),
				handler: this.#resolveHandler(handler),
				type: 'always',
			});
		}

		for (const [event, handlers] of Object.entries(on)) {
			this.#on[event] = handlers.map((handler) => ({
				condition: this.#resolveCondition(handler),
				handler: this.#resolveHandler(handler),
				type: 'dispatch',
			}));
		}

		for (const handler of entry) {
			this.#entry.push({
				condition: this.#resolveCondition(handler),
				handler: this.#resolveHandler({
					...handler,
					transitionTo: undefined,
				}),
				type: 'entry',
			});
		}

		for (const handler of exit) {
			this.#exit.push({
				condition: this.#resolveCondition(handler),
				handler: this.#resolveHandler({
					...handler,
					transitionTo: undefined,
				}),
				type: 'exit',
			});
		}

		return this;
	}
	start() {
		this[SET_INITIAL_STATE]();
		this[RUN_ENTRY_HANDLERS]([]);
		this[RUN_ALWAYS_HANDLERS]([]);
		this[STATE_CALL_SUBSCRIBERS]();

		return this;
	}
	/** @returns {AtomicStateJson} */
	toJSON() {
		return {
			name: this.__name,
		};
	}
	/** @param {any[]} value */
	[RUN_ALWAYS_HANDLERS](value) {
		return this.#executeHandlers(this.#always, value);
	}
	/** @param {any[]} value */
	[RUN_ENTRY_HANDLERS](value) {
		return this.#executeHandlers(this.#entry, value);
	}
	/** @param {any[]} value */
	[RUN_EXIT_HANDLERS](value) {
		return this.#executeHandlers(this.#exit, value);
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
	[SET_INITIAL_STATE]() {
		this.#initialized = true;
	}
	/**
	 * @returns {Record<string, (...args: any[]) => any>}
	 */
	get [STATE_ACTIONS]() {
		const actions = this[STATE_CONFIG].parent?.[STATE_ACTIONS] || {};
		for (const name in this[STATE_CONFIG].actions) {
			if (Object.hasOwn(this[STATE_CONFIG].actions, name)) {
				actions[name] = this[STATE_CONFIG].actions[name].bind(this);
			}
		}

		return actions;
	}
	/**
	 * @returns {Record<string, (...args: any[]) => boolean>}
	 */
	get [STATE_CONDITIONS]() {
		const conditions = this[STATE_CONFIG].parent?.[STATE_CONDITIONS] || {};
		for (const name in this[STATE_CONFIG].conditions) {
			if (Object.hasOwn(this[STATE_CONFIG].conditions, name)) {
				conditions[name] = this[STATE_CONFIG].conditions[name]
					.bind(this);
			}
		}

		return conditions;
	}
}
