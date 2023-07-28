import {
	EXECUTE_HANDLERS,
	EXECUTE_HANDLERS_LEAF_FIRST,
	EXECUTE_HANDLERS_ROOT_FIRST,
	FILTER_HANDLERS,
	INITIALIZE,
	QUEUE_ALWAYS_HANDLERS,
	QUEUE_ENTRY_HANDLERS,
	QUEUE_EXIT_HANDLERS,
	QUEUE_ON_HANDLERS,
	RESOLVE_CONFIG,
	STATE_ACTION,
	STATE_ACTION_CONFIGS,
	STATE_CONDITION,
	STATE_CONDITION_CONFIGS,
	STATE_HANDLER,
	STATE_NEXT_EVENTS,
	STATE_PARENT,
	STATE_STATES,
} from './constants.js';
import { Context } from './context.js';
import { Handler } from './handler.js';
import { StateEvent } from './event.js';

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
	/**
	 * Action configuration from the user that is propagated to children
	 * @type {Omit<import('./types.js').ActionConfig, 'run'>}
	 */
	#actionConfig = {};
	/**
	 * Actions from the user config
	 * @type {Record<string, import('./action.js').Action>}
	 */
	#actions = {};
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
	/**
	 * Condition configuration from the user that is propagated to children
	 * @type {Omit<import('./types.js').ConditionConfig, 'run'>}
	 */
	#conditionConfig = {};
	/**
	 * Conditions from the user config
	 * @type {Record<string, import('./condition.js').Condition>}
	 */
	#conditions = {};
	#context;
	/** @type {Handler[]} */
	#entry = [];
	/** @type {EntryHandlerConfig[]} */
	#entryConfig = [];
	/** @type {StateEvent | null} */
	#event = null;
	/** @type {Handler[]} */
	#exit = [];
	/** @type {ExitHandlerConfig[]} */
	#exitConfig = [];
	/**
	 * The active handler that is currently executing
	 *
	 * @type {import('./handler').Handler | null}
	 */
	#handler = null;
	#initialized = false;
	#isStepping = false;
	#onConfig;
	/** @type {CompoundState | null} */
	#parent = null;
	/** @private */
	__name = '';
	/**
	 * @private
	 * @type {Handler[]}
	 */
	__handlerQueue = [];
	/**
	 * @private
	 * @type {Record<string, Handler[]>}
	 */
	__onHandler = {};
	/**
	 * @private
	 * @type {Set<(arg: BaseState) => any>}
	 */
	__subscribers = new Set();

	/**
	 * @param {import('./types.js').AtomicStateConfig} [stateConfig]
	 */
	constructor(stateConfig) {
		this.#alwaysConfig = stateConfig?.always || [];
		this.#context = stateConfig?.context || new Context();
		this.__name = stateConfig?.name || '';
		this.#onConfig = stateConfig?.on || {};

		if (stateConfig?.entry) {
			for (const handler of stateConfig.entry) {
				this.#entryConfig.push(handler);
			}
		}
		if (stateConfig?.exit) {
			for (const handler of stateConfig.exit) {
				this.#exitConfig.push(handler);
			}
		}
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
					throw Error(
						`State '${path}' references unknown action '${name}'. Expected one of: ${actions.join(
							', ',
						)}`,
					);
				} else {
					throw Error(
						`State references unknown action '${name}'. Expected one of: ${actions.join(
							', ',
						)}`,
					);
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
				throw Error(
					`State '${path}' references unknown condition '${name}'. Expected one of: ${conditions.join(
						', ',
					)}`,
				);
			} else {
				throw Error(
					`State references unknown condition '${name}'. Expected one of: ${conditions.join(
						', ',
					)}`,
				);
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
					throw Error(
						`State '${path}' references unknown transition target '${transitionTo}'. '${path}' does not have siblings.`,
					);
				} else {
					throw Error(
						`State references unknown transition target '${transitionTo}'. It does not have sibling states.`,
					);
				}
			}
			to = parent[STATE_STATES].get(transitionTo);
			if (!to) {
				if (this.path.some((segment) => Boolean(segment))) {
					const path = this.path.join('.');
					throw Error(
						`State '${path}' references unknown transition target target '${transitionTo}'. Expected one of: ${[
							...parent[STATE_STATES].keys(),
						].join(', ')}.`,
					);
				} else {
					throw Error(
						`State references unknown transition target '${transitionTo}'. Expected one of: ${[
							...parent[STATE_STATES].keys(),
						].join(', ')}.`,
					);
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
	/**
	 * @returns {Record<string, import('./action.js').Action>}
	 */
	get __actions() {
		const actions = this.#parent?.__actions || {};
		for (const name in this.#actions) {
			if (Object.hasOwn(this.#actions, name)) {
				const action = this.#actions[name];
				if (!action.name) {
					// @ts-expect-error
					action.__name = name;
				}
				// @ts-expect-error
				if (typeof action.__notifyAfter !== 'boolean') {
					// @ts-expect-error
					action.__notifyAfter = this[STATE_ACTION_CONFIGS].notifyAfter;
				}
				// @ts-expect-error
				if (typeof action.__notifyBefore !== 'boolean') {
					// @ts-expect-error
					action.__notifyBefore = this[STATE_ACTION_CONFIGS].notifyBefore;
				}
				// @ts-expect-error
				action.__ownerState = this;
				actions[action.name] = action;
			}
		}

		return actions;
	}
	__callSubscribers() {
		for (const subscriber of this.__subscribers) {
			subscriber(this);
		}
		this.#parent?.__callSubscribers();
	}
	/**
	 * @returns {Record<string, import('./condition').Condition>}
	 */
	get __conditions() {
		const conditions = this.#parent?.__conditions || {};
		for (const name in this.#conditions) {
			if (Object.hasOwn(this.#conditions, name)) {
				const condition = this.#conditions[name];
				if (!condition.name) {
					// @ts-expect-error
					condition.__name = name;
				}
				// @ts-expect-error
				if (typeof condition.__notifyAfter !== 'boolean') {
					// @ts-expect-error
					condition.__notifyAfter = this[STATE_CONDITION_CONFIGS].notifyAfter;
				}
				// @ts-expect-error
				if (typeof condition.__notifyBefore !== 'boolean') {
					// @ts-expect-error
					condition.__notifyBefore = this[STATE_CONDITION_CONFIGS].notifyBefore;
				}
				// @ts-expect-error
				condition.__ownerState = this;
				conditions[condition.name] = condition;
			}
		}

		return conditions;
	}
	__toJSON() {
		const onEntries = Object.entries(this.__onHandler);
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
			name: this.__name,
			on: onEntries.length ? on : undefined,
			path: this.path,
		};
	}
	get action() {
		return this.#action;
	}
	get actions() {
		return this.__actions;
	}
	get activeEvents() {
		const activeEventsNames = new Set();
		this[STATE_NEXT_EVENTS](activeEventsNames);
		return [...activeEventsNames];
	}
	/** @param {string} path */
	canTransitionTo(path) {
		for (const handlers of Object.values(this.__onHandler)) {
			for (const handler of handlers) {
				if (handler.transitionTo?.name === path) return true;
			}
		}
		return false;
	}
	get condition() {
		return this.#condition;
	}
	get conditions() {
		return this.__conditions;
	}
	get context() {
		if (!this.#initialized) {
			throw Error("Attempted to read context before calling 'state.start()'.");
		}
		return this.#context;
	}
	/**
	 * @param {string} eventName
	 * @param {any} [value]
	 */
	dispatch(eventName, value) {
		if (!this.#initialized) {
			throw Error('Attempted dispatch before resolving state');
		}
		if (this.#isStepping) {
			throw Error('Attempted to dispatch while stepping is in progress.');
		}

		const event = new StateEvent({ name: eventName, value });
		this.#event = event;
		this[QUEUE_ON_HANDLERS](eventName);
		this[QUEUE_ALWAYS_HANDLERS]();
		this[EXECUTE_HANDLERS_LEAF_FIRST]();

		this.__callSubscribers();
		this.#event = null;
	}
	/** @returns {StateEvent | null} */
	get event() {
		return this.#event ?? this.#parent?.event ?? null;
	}
	get handler() {
		return this.#handler;
	}
	/** @param {string} name */
	isActiveEvent(name) {
		if (!this.#initialized) {
			throw Error(
				"Attempted to call 'state.isActiveEvent()' before calling 'state.start()'",
			);
		}
		return name in this.__onHandler && Boolean(this.__onHandler[name].length);
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		if (!this.#initialized) return false;
		return Boolean(
			path === this.__name ||
				(this.#action && path === this.#action.path.join('.')) ||
				(this.#condition && path === this.#condition.path.join('.')) ||
				(this.#handler && path === this.#handler.path.join('.')),
		);
	}
	/** @param {import('./types.js').MonitorConfig} config */
	monitor(config) {
		if (config.actionConfig) {
			if ('name' in config.actionConfig) {
				this.#actionConfig['name'] = config.actionConfig['name'];
			}
			if ('notifyAfter' in config.actionConfig) {
				this.#actionConfig['notifyAfter'] = config.actionConfig['notifyAfter'];
			}
			if ('notifyBefore' in config.actionConfig) {
				this.#actionConfig['notifyBefore'] =
					config.actionConfig['notifyBefore'];
			}
		}
		if (config.actions) {
			for (const [name, action] of Object.entries(config.actions)) {
				this.#actions[name] = action;
			}
		}
		if (config.conditionConfig) {
			if ('name' in config.conditionConfig) {
				this.#conditionConfig['name'] = config.conditionConfig['name'];
			}
			if ('notifyAfter' in config.conditionConfig) {
				this.#conditionConfig['notifyAfter'] =
					config.conditionConfig['notifyAfter'];
			}
			if ('notifyBefore' in config.conditionConfig) {
				this.#conditionConfig['notifyBefore'] =
					config.conditionConfig['notifyBefore'];
			}
		}
		if (config.conditions) {
			for (const [name, condition] of Object.entries(config.conditions)) {
				this.#conditions[name] = condition;
			}
		}
	}
	get name() {
		return this.__name;
	}
	get parent() {
		return this.#parent;
	}
	/** @type {string[]} */
	get path() {
		return this.#parent ? [...this.#parent.path, this.__name] : [this.__name];
	}
	// Type return as derived class instead of `BaseState`
	/** @returns {this} */
	start() {
		if (!this.#initialized) {
			this[RESOLVE_CONFIG]();
		}
		this[INITIALIZE]();

		const event = new StateEvent({ name: '_start' });
		this.#event = event;
		this[QUEUE_ENTRY_HANDLERS]();
		this[EXECUTE_HANDLERS_ROOT_FIRST]();
		this[QUEUE_ALWAYS_HANDLERS]();
		this[EXECUTE_HANDLERS_ROOT_FIRST]();
		this.__callSubscribers();
		this.#event = null;

		return this;
	}
	/**
	 * @param {string} eventName
	 * @param {any} [eventValue]
	 */
	*step(eventName, eventValue) {
		if (!this.#initialized) {
			throw Error("Attempted to step before calling 'state.start()'.");
		}
		if (this.#isStepping) {
			throw Error('Stepping is aleady in progress.');
		}

		this.#isStepping = true;
		const event = new StateEvent({ name: eventName, value: eventValue });
		this.#event = event;
		this[QUEUE_ON_HANDLERS](eventName);
		this[QUEUE_ALWAYS_HANDLERS]();

		for (const handler of this.__handlerQueue) {
			yield handler;
			if (handler.transitionTo) {
				const executed = yield* handler.stepTransition();
				if (executed) break;
			} else {
				yield* handler.stepActions();
			}
		}

		this.__handlerQueue.length = 0;
		this.#isStepping = false;
		this.__callSubscribers();
		this.#event = null;
	}
	[EXECUTE_HANDLERS_LEAF_FIRST]() {
		this[EXECUTE_HANDLERS]();
	}
	[EXECUTE_HANDLERS_ROOT_FIRST]() {
		this[EXECUTE_HANDLERS]();
	}
	[EXECUTE_HANDLERS]() {
		for (const handler of this.__handlerQueue) {
			if (handler.transitionTo) {
				const executed = handler.runTransition();
				if (executed) break;
			} else {
				handler.runActions();
			}
		}
		this.__handlerQueue.length = 0;
	}
	[FILTER_HANDLERS]() {
		const queue = [];
		for (const handler of this.__handlerQueue) {
			if (handler.condition && !handler.condition.run()) continue;
			if (handler.transitionTo) {
				queue.push(/** @type {const} */ ([handler, 'stepTransition']));
				// Handlers after the first transition are ignored
				break;
			} else {
				queue.push(/** @type {const} */ ([handler, 'stepActions']));
			}
		}
		this.__handlerQueue.length = 0;
		return queue;
	}
	[INITIALIZE]() {
		this.#initialized = true;
	}
	[QUEUE_ALWAYS_HANDLERS]() {
		this.__handlerQueue.push(...this.#always);
	}
	[QUEUE_ENTRY_HANDLERS]() {
		this.__handlerQueue.push(...this.#entry);
	}
	[QUEUE_EXIT_HANDLERS]() {
		this.__handlerQueue.push(...this.#exit);
	}
	/**
	 * @param {string} eventName
	 */
	[QUEUE_ON_HANDLERS](eventName) {
		if (Object.hasOwn(this.__onHandler, eventName)) {
			this.__handlerQueue.push(...this.__onHandler[eventName]);
		}
	}
	[RESOLVE_CONFIG]() {
		this.#allActions = this.__actions;
		this.#allConditions = this.__conditions;

		if (this.#context) {
			// @ts-expect-error
			this.#context.__ownerState = this;
		}

		for (const [index, handler] of this.#alwaysConfig.entries()) {
			this.#always.push(this.#resolveHandler(handler, String(index)));
		}

		for (const [event, handlers] of Object.entries(this.#onConfig)) {
			this.__onHandler[event] = handlers.map((handler, i) =>
				this.#resolveHandler(handler, String(i)),
			);
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
			notifyAfter:
				this.#actionConfig.notifyAfter ??
				this.#parent?.[STATE_ACTION_CONFIGS].notifyAfter ??
				false,
			notifyBefore:
				this.#actionConfig.notifyBefore ??
				this.#parent?.[STATE_ACTION_CONFIGS].notifyBefore ??
				false,
		};
	}
	/** @param {import('./action.js').Action | null} value */
	set [STATE_ACTION](value) {
		this.#action = value;
	}

	/**
	 * @returns {{
	 *     notifyBefore: boolean;
	 *     notifyAfter: boolean;
	 * }}
	 */
	get [STATE_CONDITION_CONFIGS]() {
		return {
			notifyAfter:
				this.#conditionConfig.notifyAfter ??
				this.#parent?.[STATE_CONDITION_CONFIGS].notifyAfter ??
				false,
			notifyBefore:
				this.#conditionConfig.notifyBefore ??
				this.#parent?.[STATE_CONDITION_CONFIGS].notifyBefore ??
				false,
		};
	}
	/**
	 * @param {import('./condition.js').Condition | null} value
	 */
	set [STATE_CONDITION](value) {
		this.#condition = value;
	}

	/**
	 * @param {import('./handler').Handler | null} value
	 */
	set [STATE_HANDLER](value) {
		this.#handler = value;
	}
	/**
	 * @param {Set<string>} stateTreeEvents
	 */
	[STATE_NEXT_EVENTS](stateTreeEvents) {
		for (const [name, handlers] of Object.entries(this.__onHandler)) {
			if (handlers.length) {
				stateTreeEvents.add(name);
			}
		}
	}
	get [STATE_PARENT]() {
		return this.#parent;
	}
	set [STATE_PARENT](value) {
		this.#parent = value;
	}
}
