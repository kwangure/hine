import {
	ACTION_NAME,
	ACTION_NOTIFY_AFTER,
	ACTION_NOTIFY_BEFORE,
	ACTION_OWNER,
	CALL_SUBSCRIBERS,
	CONDITION_NAME,
	CONDITION_NOTIFY_AFTER,
	CONDITION_NOTIFY_BEFORE,
	CONDITION_OWNER,
	INITIALIZE,
	RESOLVE_CONFIG,
	RUN_ALWAYS_HANDLERS,
	RUN_ENTRY_HANDLERS,
	RUN_EXIT_HANDLERS,
	RUN_ON_HANDLERS,
	STATE_ACTION,
	STATE_ACTION_CONFIGS,
	STATE_ACTIONS,
	STATE_ACTIVE,
	STATE_CONDITION,
	STATE_CONDITION_CONFIGS,
	STATE_CONDITIONS,
	STATE_NAME,
	STATE_PARENT,
	STATE_STATES,
} from './constants.js';
import { Condition } from './condition.js';

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
 * @typedef {import('./compound.js').CompoundState} CompoundState
 *
 * @typedef {import('./types.js').StateNode} StateNode
 */

export class BaseState {
	/** @type {import('./action.js').Action<this> | null} */
	#action = null;
	#actionConfig;
	#actions;
	/** @type {AlwaysHandler[]} */
	#always = [];
	#alwaysConfig;
	/** @type {import('./condition.js').Condition<this> | null} */
	#condition = null;
	#conditionConfig;
	#conditions;
	/** @type {EntryHandler[]} */
	#entry = [];
	#entryConfig;
	/** @type {ExitHandler[]} */
	#exit = [];
	#exitConfig;
	#initialized = false;
	#name = '';
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};

	#onConfig;
	/** @type {CompoundState | null} */
	#parent = null;
	/** @type {Set<(arg: BaseState) => any>} */
	#subscribers = new Set();

	/**
	 * @param {import('./types.js').AtomicStateConfig} [stateConfig]
	 */
	constructor(stateConfig) {
		this.#actions = stateConfig?.actions || {};
		this.#actionConfig = stateConfig?.actionConfig || {};
		this.#alwaysConfig = stateConfig?.always || [];
		this.#conditions = stateConfig?.conditions || {};
		this.#conditionConfig = stateConfig?.conditionConfig || {};
		this.#entryConfig = stateConfig?.entry || [];
		this.#exitConfig = stateConfig?.exit || [];
		this.#name = stateConfig?.name || '';
		this.#onConfig = stateConfig?.on || {};
	}
	/**
	 * @param {Handler[]} handlers
	 * @param {any} value
	 */
	#executeHandlers(handlers, value) {
		for (const { condition, handler } of handlers) {
			if (!condition.run(value)) continue;
			const transitioned = handler(value);
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
			const condition = new Condition({ run() {
				return true;
			} });
			condition[CONDITION_OWNER] = this;
			return condition;
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

			/** @param {any} value */
			return (value) => {
				// exit actions for the current state
				from[RUN_EXIT_HANDLERS](value);
				// transition actions for the handler
				for (const action of actions) {
					action.run(value);
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

		/** @param {any} value */
		return (value) => {
			for (const action of actions) {
				action.run(value);
			}
			return false;
		};
	}
	get action() {
		return this.#action;
	}
	get condition() {
		return this.#condition;
	}
	get conditions() {
		return this[STATE_CONDITIONS];
	}
	/**
	 * @param {string} event
	 * @param {any} [value]
	 */
	dispatch(event, value) {
		if (!this.#initialized) {
			throw Error('Attempted dispatch before resolving state');
		}
		this[RUN_ON_HANDLERS](event, value);
		this[CALL_SUBSCRIBERS]();
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
	get parent() {
		return this.#parent;
	}
	start() {
		if (!this.#initialized) {
			this[RESOLVE_CONFIG]();
		}
		this[INITIALIZE]();
		this[RUN_ENTRY_HANDLERS]([]);
		this[RUN_ALWAYS_HANDLERS]([]);
		this[CALL_SUBSCRIBERS]();

		return this;
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.#subscribers.add(/** @type {(arg: BaseState) => any} */(fn));
		return () => {
			this.#subscribers.delete(/** @type {(arg: BaseState) => any} */(fn));
		};
	}
	[CALL_SUBSCRIBERS]() {
		for (const subscriber of this.#subscribers) {
			subscriber(this);
		}
		this.#parent?.[CALL_SUBSCRIBERS]();
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
	 * @returns {{
	 *     notifyBefore: boolean;
	 *     notifyAfter: boolean;
	 * }}
	 */
	get [STATE_ACTION_CONFIGS]() {
		return {
			notifyAfter: this.#actionConfig.notifyAfter
				?? this.#parent?.[STATE_ACTION_CONFIGS].notifyAfter
				?? false,
			notifyBefore: this.#actionConfig.notifyBefore
				?? this.#parent?.[STATE_ACTION_CONFIGS].notifyBefore
				?? false,
		};
	}
	/** @param {import('./action.js').Action<this> | null} value */
	set [STATE_ACTION](value) {
		this.#action = value;
	}
	/**
	 * @returns {Record<string, import('./action.js').Action>}
	 */
	get [STATE_ACTIONS]() {
		const actions = this.#parent?.[STATE_ACTIONS] || {};
		for (const name in this.#actions) {
			if (Object.hasOwn(this.#actions, name)) {
				const action = this.#actions[name];
				if (!action.name) {
					action[ACTION_NAME] = name;
				}
				if (typeof action[ACTION_NOTIFY_AFTER] !== 'boolean') {
					action[ACTION_NOTIFY_AFTER]
						= this[STATE_ACTION_CONFIGS].notifyAfter;
				}
				if (typeof action[ACTION_NOTIFY_BEFORE] !== 'boolean') {
					action[ACTION_NOTIFY_BEFORE]
						= this[STATE_ACTION_CONFIGS].notifyBefore;
				}
				action[ACTION_OWNER] = this;
				actions[action.name] = action;
			}
		}

		return actions;
	}
	/**
	 * @returns {{
	 *     notifyBefore: boolean;
	 *     notifyAfter: boolean;
	 * }}
	 */
	get [STATE_CONDITION_CONFIGS]() {
		return {
			notifyAfter: this.#conditionConfig.notifyAfter
				?? this.#parent?.[STATE_CONDITION_CONFIGS].notifyAfter
				?? false,
			notifyBefore: this.#conditionConfig.notifyBefore
				?? this.#parent?.[STATE_CONDITION_CONFIGS].notifyBefore
				?? false,
		};
	}
	/** @param {import('./condition.js').Condition<this> | null} value */
	set [STATE_CONDITION](value) {
		this.#condition = value;
	}
	/**
	 * @returns {Record<string, Condition>}
	 */
	get [STATE_CONDITIONS]() {
		const conditions = this.#parent?.[STATE_CONDITIONS] || {};
		for (const name in this.#conditions) {
			if (Object.hasOwn(this.#conditions, name)) {
				const condition = this.#conditions[name];
				if (!condition.name) {
					condition[CONDITION_NAME] = name;
				}
				if (typeof condition[CONDITION_NOTIFY_AFTER] !== 'boolean') {
					condition[CONDITION_NOTIFY_AFTER]
						= this[STATE_CONDITION_CONFIGS].notifyAfter;
				}
				if (typeof condition[CONDITION_NOTIFY_BEFORE] !== 'boolean') {
					condition[CONDITION_NOTIFY_BEFORE]
						= this[STATE_CONDITION_CONFIGS].notifyBefore;
				}
				condition[CONDITION_OWNER] = this;
				conditions[condition.name] = condition;
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
