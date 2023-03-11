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
	/** @type {string} */
	#name = '';
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};

	/**
	 * @type {AtomicStateConfig & {
	 *     siblings: Map<string, AtomicState>
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
		siblings: new Map(),
	};

	/**
	 * @param {Partial<AtomicStateConfig>} [config]
	 */
	constructor(config) {
		super();
		if (config) {
			this.configure(config);
		}
	}

	/**
	 * @param {Handler[]} handlers
	 * @param {any[]} args
	 */
	#executeHandlers(handlers, args) {
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
	 * @param {Partial<HandlerConfig>} handler
	 */
	#resolveActions(handler) {
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
	#resolveTransition(handler) {
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
	/**
	 * @param {((...args: any) => any)[]} actions
	 * @param {any[]} args
	 */
	#runActions(actions, args) {
		for (const action of actions) {
			action.call(this, ...args);
		}
	}
	/** @param {Partial<AtomicStateConfig>} stateConfig */
	configure(stateConfig) {
		const config = this[STATE_CONFIG];
		config.name = stateConfig.name || config.name;

		Object.assign(config.actions, stateConfig.actions);
		Object.assign(config.conditions, stateConfig.conditions);
		Object.assign(config.on, stateConfig.on);

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
		this[RUN_ON_HANDLERS](event, value);
		this[STATE_CALL_SUBSCRIBERS]();
	}
	get name() {
		return this.#name;
	}
	resolve() {
		const { always, entry, exit, name, on } = this[STATE_CONFIG];
		this.#name = name;

		for (const handler of always) {
			this.#always.push({
				actions: this.#resolveActions(handler),
				condition: this.#resolveCondition(handler),
				transitionTo: this.#resolveTransition(handler),
				type: 'always',
			});
		}

		for (const [event, handlers] of Object.entries(on)) {
			this.#on[event] = handlers.map((handler) => ({
				actions: this.#resolveActions(handler),
				condition: this.#resolveCondition(handler),
				transitionTo: this.#resolveTransition(handler),
				type: 'dispatch',
			}));
		}

		for (const handler of entry) {
			this.#entry.push({
				actions: this.#resolveActions(handler),
				condition: this.#resolveCondition(handler),
				transitionTo: null,
				type: 'entry',
			});
		}

		for (const handler of exit) {
			this.#exit.push({
				actions: this.#resolveActions(handler),
				condition: this.#resolveCondition(handler),
				transitionTo: null,
				type: 'exit',
			});
		}

		return this;
	}
	start() {
		this[RUN_ENTRY_HANDLERS]([]);
		this[RUN_ALWAYS_HANDLERS]([]);

		return this;
	}
	/** @returns {AtomicStateJson} */
	toJSON() {
		return {
			name: this.name,
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
	[SET_INITIAL_STATE]() {}
}
