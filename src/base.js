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
	EXECUTE_HANDLERS,
	EXECUTE_HANDLERS_LEAF_FIRST,
	EXECUTE_HANDLERS_ROOT_FIRST,
	HANDLER_QUEUE,
	INITIALIZE,
	QUEUE_ALWAYS_HANDLERS,
	QUEUE_ENTRY_HANDLERS,
	QUEUE_EXIT_HANDLERS,
	QUEUE_ON_HANDLERS,
	RESOLVE_CONFIG,
	RETURN_HANDLERS_LEAF_FIRST,
	RETURN_HANDLERS_ROOT_FIRST,
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
	STATE_SUBSCRIBERS,
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
	#isStepping = false;
	#name = '';
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};

	#onConfig;
	/** @type {CompoundState | null} */
	#parent = null;

	/** @type {Handler[]} */
	[HANDLER_QUEUE] = [];
	/** @type {Set<(arg: BaseState) => any>} */
	[STATE_SUBSCRIBERS] = new Set();

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
				from[HANDLER_QUEUE].length = 0;
				// exit actions for the current state
				from[QUEUE_EXIT_HANDLERS]();
				this[EXECUTE_HANDLERS](from[RETURN_HANDLERS_LEAF_FIRST]());

				// transition actions for the handler
				for (const action of actions) {
					action.run(value);
				}
				// change the active nested state for parent state
				parent[STATE_ACTIVE] = to;
				// set initial state from transitionTo to leaves
				to[INITIALIZE]();

				to[QUEUE_ENTRY_HANDLERS]();
				this[EXECUTE_HANDLERS](to[RETURN_HANDLERS_ROOT_FIRST]());

				to[QUEUE_ALWAYS_HANDLERS]();
				this[EXECUTE_HANDLERS](to[RETURN_HANDLERS_ROOT_FIRST]());
			};
		}

		/** @param {any} value */
		return (value) => {
			for (const action of actions) {
				action.run(value);
			}
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
		if (this.#isStepping) {
			throw Error('Attempted to dispatch while stepping is in progress.');
		}
		this[QUEUE_ON_HANDLERS](event);
		this[QUEUE_ALWAYS_HANDLERS]();
		this[EXECUTE_HANDLERS_LEAF_FIRST](value);

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
		this[QUEUE_ENTRY_HANDLERS]();
		this[EXECUTE_HANDLERS](this[RETURN_HANDLERS_ROOT_FIRST]());
		this[QUEUE_ALWAYS_HANDLERS]();
		this[EXECUTE_HANDLERS](this[RETURN_HANDLERS_ROOT_FIRST]());
		this[CALL_SUBSCRIBERS]();

		return this;
	}
	/**
	 * @param {string} event
	 * @param {any} [eventValue]
	 */
	* step(event, eventValue) {
		if (!this.#initialized) {
			throw Error('Attempted to step before calling \'state.start()\'.');
		}
		if (this.#isStepping) {
			throw Error('Stepping is aleady in progress.');
		}

		this.#isStepping = true;
		this[QUEUE_ON_HANDLERS](event);
		this[QUEUE_ALWAYS_HANDLERS]();

		const iterator = this[HANDLER_QUEUE][Symbol.iterator]();
		/** @type {boolean | undefined} */
		let queueDone = false;
		/** @type {Handler} */
		let queueNext;

		({ value: queueNext, done: queueDone } = iterator.next());
		while (!queueDone) {
			const { condition, handler } = queueNext;
			if (condition.run(eventValue)) {
				handler(eventValue);
			}
			({ value: queueNext, done: queueDone } = iterator.next());
			yield this;
		}
		this.#isStepping = false;
		this[HANDLER_QUEUE].length = 0;
		this[CALL_SUBSCRIBERS]();
	}
	[CALL_SUBSCRIBERS]() {
		for (const subscriber of this[STATE_SUBSCRIBERS]) {
			subscriber(this);
		}
		this.#parent?.[CALL_SUBSCRIBERS]();
	}
	/**
	 * @param {any} [value]
	 */
	[EXECUTE_HANDLERS_LEAF_FIRST](value) {
		for (const { condition, handler } of this[HANDLER_QUEUE]) {
			if (!condition.run(value)) continue;
			handler(value);
		}
		this[HANDLER_QUEUE].length = 0;
	}
	/**
	 * @param {any} [value]
	 */
	[EXECUTE_HANDLERS_ROOT_FIRST](value) {
		for (const { condition, handler } of this[HANDLER_QUEUE]) {
			if (!condition.run(value)) continue;
			handler(value);
		}
		this[HANDLER_QUEUE].length = 0;
	}
	/**
	 * @param {Handler[]} handlers
	 * @param {any} [value]
	 */
	[EXECUTE_HANDLERS](handlers, value) {
		for (const { condition, handler } of handlers) {
			if (!condition.run(value)) continue;
			handler(value);
		}
	}
	[INITIALIZE]() {
		this.#initialized = true;
	}
	[QUEUE_ALWAYS_HANDLERS]() {
		this[HANDLER_QUEUE].push(...this.#always);
	}
	[QUEUE_ENTRY_HANDLERS]() {
		this[HANDLER_QUEUE].push(...this.#entry);
	}
	[QUEUE_EXIT_HANDLERS]() {
		this[HANDLER_QUEUE].push(...this.#exit);
	}
	/**
	 * @param {string} event
	 */
	[QUEUE_ON_HANDLERS](event) {
		if (Object.hasOwn(this.#on, event)) {
			this[HANDLER_QUEUE].push(...this.#on[event]);
		}
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
	[RETURN_HANDLERS_LEAF_FIRST]() {
		const result = [...this[HANDLER_QUEUE]];
		this[HANDLER_QUEUE].length = 0;
		return result;
	}
	[RETURN_HANDLERS_ROOT_FIRST]() {
		const result = [...this[HANDLER_QUEUE]];
		this[HANDLER_QUEUE].length = 0;
		return result;
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
