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
	FILTER_HANDLERS,
	HANDLER_QUEUE,
	INITIALIZE,
	ON_HANDLER,
	QUEUE_ALWAYS_HANDLERS,
	QUEUE_ENTRY_HANDLERS,
	QUEUE_EXIT_HANDLERS,
	QUEUE_ON_HANDLERS,
	RESOLVE_CONFIG,
	STATE_ACTION,
	STATE_ACTION_CONFIGS,
	STATE_ACTIONS,
	STATE_CONDITION,
	STATE_CONDITION_CONFIGS,
	STATE_CONDITIONS,
	STATE_HANDLER,
	STATE_NAME,
	STATE_PARENT,
	STATE_STATES,
	STATE_SUBSCRIBERS,
	TO_JSON,
} from './constants.js';
import { Handler } from './handler.js';

/**
 * @typedef {import('./types.js').AlwaysHandlerConfig} AlwaysHandlerConfig
 * @typedef {import('./types.js').DispatchHandlerConfig} DispatchHandlerConfig
 * @typedef {import('./types.js').EntryHandlerConfig} EntryHandlerConfig
 * @typedef {import('./types.js').ExitHandlerConfig} ExitHandlerConfig
 *
 * @typedef {import('./compound.js').CompoundState} CompoundState
 *
 * @typedef {import('./types.js').StateNode} StateNode
 */

export class BaseState {
	/** @type {import('./action.js').Action | null} */
	#action = null;
	#actionConfig;
	/** Actions from the user config */
	#actions;
	/**
	 * Actions from all ancestor states and the config
	 * @type {Record<string, import('./action').Action>}
	 */
	#allActions = {};
	/**
	 * Conditions from all ancestor states and the config
	 * @type {Record<string, import('./condition').Condition>}
	 */
	#allConditions = {};
	/** @type {Handler[]} */
	#always = [];
	#alwaysConfig;
	/** @type {import('./condition.js').Condition | null} */
	#condition = null;
	#conditionConfig;
	/** Conditions from the user config */
	#conditions;
	/** @type {Handler[]} */
	#entry = [];
	#entryConfig;
	/** @type {Handler[]} */
	#exit = [];
	#exitConfig;
	/**
	 * The active handler that is currently executing
	 *
	 * @type {import('./handler').Handler | null}
	 */
	#handler = null;
	#initialized = false;
	#isStepping = false;
	#name = '';
	#onConfig;
	/** @type {CompoundState | null} */
	#parent = null;

	/** @type {Handler[]} */
	[HANDLER_QUEUE] = [];
	/** @type {Record<string, Handler[]>} */
	[ON_HANDLER] = {};
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
	 * @param {Partial<AlwaysHandlerConfig | DispatchHandlerConfig | EntryHandlerConfig | ExitHandlerConfig>} handler
	 */
	#resolveActions(handler) {
		const actions = [];
		for (const name of handler.actions || []) {
			const action = this.#allActions[name];
			if (!action) {
				const actions = Object.keys(this.#allActions);
				if (this.path.some((segment) => Boolean(segment))) {
					const path = this.path.join('.');
					throw Error(`State '${path}' references unknown action '${name}'. Expected one of: ${actions.join(', ')}`);
				} else {
					throw Error(`State references unknown action '${name}'. Expected one of: ${actions.join(', ')}`);
				}
			}
			actions.push(action);
		}
		return actions;
	}
	/**
	 * @param {Partial<AlwaysHandlerConfig | DispatchHandlerConfig | EntryHandlerConfig | ExitHandlerConfig>} handler
	 */
	#resolveCondition(handler) {
		const { condition: name } = handler;
		if (name === undefined) return;

		const condition = this.#allConditions[name];
		if (!condition) {
			const conditions = Object.keys(this.#allConditions);
			if (this.path.some((segment) => Boolean(segment))) {
				const path = this.path.join('.');
				throw Error(`State '${path}' references unknown condition '${name}'. Expected one of: ${conditions.join(', ')}`);
			} else {
				throw Error(`State references unknown condition '${name}'. Expected one of: ${conditions.join(', ')}`);
			}
		}

		return condition;
	}
	/**
	 * @param {Partial<AlwaysHandlerConfig | DispatchHandlerConfig>} handler
	 * @param {string} name
	 */
	#resolveHandler(handler, name) {
		const { transitionTo } = handler;
		const actions = this.#resolveActions(handler);
		let to;
		if (transitionTo) {
			const parent = this.#parent;
			if (!parent) {
				if (this.path.some((segment) => Boolean(segment))) {
					const path = this.path.join('.');
					throw Error(`State '${path}' references unknown transition target '${transitionTo}'. '${path}' does not have siblings.`);
				} else {
					throw Error(`State references unknown transition target '${transitionTo}'. It does not have sibling states.`);
				}
			}
			to = parent[STATE_STATES].get(transitionTo);
			if (!to) {
				if (this.path.some((segment) => Boolean(segment))) {
					const path = this.path.join('.');
					throw Error(`State '${path}' references unknown transition target target '${transitionTo}'. Expected one of: ${[...parent[STATE_STATES].keys()].join(', ')}.`);
				} else {
					throw Error(`State references unknown transition target '${transitionTo}'. Expected one of: ${[...parent[STATE_STATES].keys()].join(', ')}.`);
				}
			}
		}

		return new Handler({
			actions,
			name,
			condition: this.#resolveCondition(handler),
			ownerState: this,
			transitionTo: to,
		});
	}
	get action() {
		return this.#action;
	}
	get actions() {
		return this[STATE_ACTIONS];
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
	get handler() {
		return this.#handler;
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		if (!this.#initialized) return false;
		return Boolean(
			path === this.#name
			|| (this.#action && path === this.#action.path.join('.'))
			|| (this.#condition && path === this.#condition.path.join('.'))
			|| (this.#handler && path === this.#handler.path.join('.')),
		);
	}
	get name() {
		return this.#name;
	}
	get parent() {
		return this.#parent;
	}
	/** @type {string[]} */
	get path() {
		return this.#parent
			? [...this.#parent.path, this.#name]
			: [this.#name];
	}
	// Type return as derived class instead of `BaseState`
	/** @returns {this} */
	start() {
		if (!this.#initialized) {
			this[RESOLVE_CONFIG]();
		}
		this[INITIALIZE]();
		this[QUEUE_ENTRY_HANDLERS]();
		this[EXECUTE_HANDLERS_ROOT_FIRST]();
		this[QUEUE_ALWAYS_HANDLERS]();
		this[EXECUTE_HANDLERS_ROOT_FIRST]();
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

		for (const handler of this[HANDLER_QUEUE]) {
			yield handler;
			if (handler.transitionTo) {
				const executed = yield* handler.stepTransition(eventValue);
				if (executed) break;
			} else {
				yield* handler.stepActions(eventValue);
			}
		}

		this[HANDLER_QUEUE].length = 0;
		this.#isStepping = false;
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
		this[EXECUTE_HANDLERS](value);
	}
	/**
	 * @param {any} [value]
	 */
	[EXECUTE_HANDLERS_ROOT_FIRST](value) {
		this[EXECUTE_HANDLERS](value);
	}
	/**
	 * @param {any} [value]
	 */
	[EXECUTE_HANDLERS](value) {
		for (const handler of this[HANDLER_QUEUE]) {
			if (handler.transitionTo) {
				const executed = handler.runTransition(value);
				if (executed) break;
			} else {
				handler.runActions(value);
			}
		}
		this[HANDLER_QUEUE].length = 0;
	}
	/**
	 * @param {any} [value]
	 */
	[FILTER_HANDLERS](value) {
		const queue = [];
		for (const handler of this[HANDLER_QUEUE]) {
			if (handler.condition && !handler.condition.run(value)) continue;
			if (handler.transitionTo) {
				queue.push(/** @type {const} */([handler, 'stepTransition']));
				// Handlers after the first transition are ignored
				break;
			} else {
				queue.push(/** @type {const} */([handler, 'stepActions']));
			}
		}
		this[HANDLER_QUEUE].length = 0;
		return queue;
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
		if (Object.hasOwn(this[ON_HANDLER], event)) {
			this[HANDLER_QUEUE].push(...this[ON_HANDLER][event]);
		}
	}
	[RESOLVE_CONFIG]() {
		this.#allActions = this[STATE_ACTIONS];
		this.#allConditions = this[STATE_CONDITIONS];

		for (const [index, handler] of this.#alwaysConfig.entries()) {
			this.#always.push(this.#resolveHandler(handler, String(index)));
		}

		for (const [event, handlers] of Object.entries(this.#onConfig)) {
			this[ON_HANDLER][event] = handlers
				.map((handler, i) => this.#resolveHandler(handler, String(i)));
		}

		for (const [index, handler] of this.#entryConfig.entries()) {
			this.#entry.push(this.#resolveHandler(handler, String(index)));
		}

		for (const [index, handler] of this.#exitConfig.entries()) {
			this.#exit.push(this.#resolveHandler(handler, String(index)));
		}
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
	/** @param {import('./action.js').Action | null} value */
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
				// @ts-ignore
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
	/**
	 * @param {import('./condition.js').Condition | null} value
	 */
	set [STATE_CONDITION](value) {
		this.#condition = value;
	}
	/**
	 * @returns {Record<string, import('./condition').Condition>}
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
				// @ts-ignore
				condition[CONDITION_OWNER] = this;
				conditions[condition.name] = condition;
			}
		}

		return conditions;
	}
	/**
	 * @param {import('./handler').Handler | null} value
	 */
	set [STATE_HANDLER](value) {
		this.#handler = value;
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
	[TO_JSON]() {
		const onEntries = Object.entries(this[ON_HANDLER]);
		/** @type {Record<string, import('./types.js').HandlerJSON[]>} */
		const on = {};
		for (const [event, handlers] of onEntries) {
			on[event] = handlers.map((handler) => handler.toJSON());
		}

		return {
			always: this.#always.length
				? this.#always.map((handler) => handler.toJSON())
				: undefined,
			entry: this.#entry.length
				? this.#entry.map((handler) => handler.toJSON())
				: undefined,
			exit: this.#exit.length
				? this.#exit.map((handler) => handler.toJSON())
				: undefined,
			name: this.#name,
			on: onEntries.length ? on : undefined,
			path: this.path,
		};
	}
}
