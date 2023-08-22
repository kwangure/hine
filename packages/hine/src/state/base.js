import { Context } from '../context.js';
import { StateEvent } from '../event.js';
import { TransitionHandler } from '../handler/transition.js';

export class BaseState {
	/**
	 * Action configuration from the user that is propagated to children
	 * @type {Omit<import('../types.js').ActionConfig, 'run'>}
	 */
	#actionConfig = {};
	/**
	 * Actions from the user config
	 * @type {Record<string, import('../action.js').Action>}
	 */
	#actions = {};
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	#always = [];
	#alwaysConfig;
	/**
	 * Condition configuration from the user that is propagated to children
	 * @type {Omit<import('../types.js').ConditionConfig, 'run'>}
	 */
	#conditionConfig = {};
	/**
	 * Conditions from the user config
	 * @type {Record<string, import('../condition.js').Condition>}
	 */
	#conditions = {};
	#context;
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	#entry = [];
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	#entryConfig = [];
	/** @type {StateEvent | null} */
	#event = null;
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	#exit = [];
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	#exitConfig = [];
	#initialized = false;
	#isStepping = false;
	#onConfig;
	/**
	 * Actions from all ancestor states and the config
	 * @type {Record<string, import('../action.js').Action>}
	 */
	__allActions = {};
	/**
	 * Conditions from all ancestor states and the config
	 * @type {Record<string, import('../condition.js').Condition>}
	 */
	__allConditions = {};

	/** @type {import('../action.js').Action | null} */
	__action = null;
	/** @type {import('../condition.js').Condition | null} */
	__condition = null;
	/**
	 * The active handler that is currently executing
	 *
	 * @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler) | null}
	 */
	__handler = null;
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	__handlerQueue = [];
	__name = '';
	/** @type {import('./compound.js').CompoundState | null} */
	__parent = null;
	/** @type {Record<string, (import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]>} */
	__onHandler = {};
	/** @type {Set<(arg: BaseState) => any>} */
	__subscribers = new Set();

	/**
	 * @param {import('./types.js').BaseStateConfig} [stateConfig]
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
	 * @returns {{
	 *     notifyBefore: boolean;
	 *     notifyAfter: boolean;
	 * }}
	 */
	get __actionConfig() {
		return {
			notifyAfter:
				this.#actionConfig.notifyAfter ??
				this.__parent?.__actionConfig.notifyAfter ??
				false,
			notifyBefore:
				this.#actionConfig.notifyBefore ??
				this.__parent?.__actionConfig.notifyBefore ??
				false,
		};
	}
	/**
	 * @returns {Record<string, import('../action.js').Action>}
	 */
	get __actions() {
		const actions = this.__parent?.__actions || {};
		for (const name in this.#actions) {
			if (Object.hasOwn(this.#actions, name)) {
				const action = this.#actions[name];
				if (!action.name) {
					action.__name = name;
				}
				if (typeof action.__notifyAfter !== 'boolean') {
					action.__notifyAfter = this.__actionConfig.notifyAfter;
				}
				if (typeof action.__notifyBefore !== 'boolean') {
					action.__notifyBefore = this.__actionConfig.notifyBefore;
				}
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
		this.__parent?.__callSubscribers();
	}
	/**
	 * @returns {{
	 *     notifyBefore: boolean;
	 *     notifyAfter: boolean;
	 * }}
	 */
	get __conditionConfig() {
		return {
			notifyAfter:
				this.#conditionConfig.notifyAfter ??
				this.__parent?.__conditionConfig.notifyAfter ??
				false,
			notifyBefore:
				this.#conditionConfig.notifyBefore ??
				this.__parent?.__conditionConfig.notifyBefore ??
				false,
		};
	}
	/**
	 * @returns {Record<string, import('../condition.js').Condition>}
	 */
	get __conditions() {
		const conditions = this.__parent?.__conditions || {};
		for (const name in this.#conditions) {
			if (Object.hasOwn(this.#conditions, name)) {
				const condition = this.#conditions[name];
				if (!condition.name) {
					condition.__name = name;
				}
				if (typeof condition.__notifyAfter !== 'boolean') {
					condition.__notifyAfter = this.__conditionConfig.notifyAfter;
				}
				if (typeof condition.__notifyBefore !== 'boolean') {
					condition.__notifyBefore = this.__conditionConfig.notifyBefore;
				}
				condition.__ownerState = this;
				conditions[condition.name] = condition;
			}
		}

		return conditions;
	}
	__executeHandlers() {
		for (const handler of this.__handlerQueue) {
			const wasExecuted = handler.run();
			// transitions short-circuit handler execution
			if (wasExecuted && handler instanceof TransitionHandler) break;
		}
		this.__handlerQueue.length = 0;
	}
	__executeHandlersLeafFirst() {
		this.__executeHandlers();
	}
	__executeHandlersRootFirst() {
		this.__executeHandlers();
	}
	__initialize() {
		this.#initialized = true;
	}
	/**
	 * @param {Set<string>} stateTreeEvents
	 */
	__nextEvents(stateTreeEvents) {
		for (const [name, handlers] of Object.entries(this.__onHandler)) {
			if (handlers.length) {
				stateTreeEvents.add(name);
			}
		}
	}
	__queueAlwaysHandlers() {
		this.__handlerQueue.push(...this.#always);
	}
	__queueEntryHandlers() {
		this.__handlerQueue.push(...this.#entry);
	}
	__queueExitHandlers() {
		this.__handlerQueue.push(...this.#exit);
	}
	/**
	 * @param {string} eventName
	 */
	__queueOnHandlers(eventName) {
		if (Object.hasOwn(this.__onHandler, eventName)) {
			this.__handlerQueue.push(...this.__onHandler[eventName]);
		}
	}
	__resolveConfig() {
		this.__allActions = this.__actions;
		this.__allConditions = this.__conditions;
		this.#context.__ownerState = this;

		for (const [index, handler] of this.#alwaysConfig.entries()) {
			handler.__resolve({ name: String(index), ownerState: this });
			this.#always.push(handler);
		}

		for (const [event, handlers] of Object.entries(this.#onConfig)) {
			this.__onHandler[event] = handlers.map((handler, i) => {
				handler.__resolve({ name: String(i), ownerState: this });
				return handler;
			});
		}

		for (const [index, handler] of this.#entryConfig.entries()) {
			handler.__resolve({ name: String(index), ownerState: this });
			this.#entry.push(handler);
		}

		for (const [index, handler] of this.#exitConfig.entries()) {
			handler.__resolve({ name: String(index), ownerState: this });
			this.#exit.push(handler);
		}
	}
	__toJSON() {
		const onEntries = Object.entries(this.__onHandler);
		/** @type {Record<string, import('../types.js').HandlerJSON[]>} */
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
		return this.__action;
	}
	get actions() {
		return this.__actions;
	}
	get activeEvents() {
		const activeEventsNames = new Set();
		this.__nextEvents(activeEventsNames);
		return [...activeEventsNames];
	}
	/** @param {string} path */
	canTransitionTo(path) {
		for (const handlers of Object.values(this.__onHandler)) {
			for (const handler of handlers) {
				if (
					handler instanceof TransitionHandler &&
					handler.transitionTo?.name === path
				)
					return true;
			}
		}
		return false;
	}
	get condition() {
		return this.__condition;
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
		this.__queueOnHandlers(eventName);
		this.__queueAlwaysHandlers();
		this.__executeHandlersLeafFirst();

		this.__callSubscribers();
		this.#event = null;
	}
	/** @returns {StateEvent | null} */
	get event() {
		return this.#event ?? this.__parent?.event ?? null;
	}
	get handler() {
		return this.__handler;
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
				(this.__action && path === this.__action.path.join('.')) ||
				(this.__condition && path === this.__condition.path.join('.')) ||
				(this.__handler && path === this.__handler.path.join('.')),
		);
	}
	/** @param {import('../types.js').BaseMonitorConfig} config */
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
		return this.__parent;
	}
	/** @type {string[]} */
	get path() {
		return this.__parent ? [...this.__parent.path, this.__name] : [this.__name];
	}
	start() {
		if (!this.#initialized) {
			this.__resolveConfig();
		}
		this.__initialize();

		const event = new StateEvent({ name: '_start' });
		this.#event = event;
		this.__queueEntryHandlers();
		this.__executeHandlersRootFirst();
		this.__queueAlwaysHandlers();
		this.__executeHandlersRootFirst();
		this.__callSubscribers();
		this.#event = null;
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
		this.__queueOnHandlers(eventName);
		this.__queueAlwaysHandlers();

		for (const handler of this.__handlerQueue) {
			yield handler;
			if (handler instanceof TransitionHandler) {
				const executed = yield* handler.step();
				if (executed) break;
			} else {
				yield* handler.step();
			}
		}

		this.__handlerQueue.length = 0;
		this.#isStepping = false;
		this.__callSubscribers();
		this.#event = null;
	}
}
