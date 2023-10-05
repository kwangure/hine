import { createHandler, normalizeHandlerConfig } from './util.js';
import { ActionRunner } from '../runner/action.js';
import { ConditionRunner } from '../runner/condition.js';
import { Context } from '../context/context.js';
import { StateEvent } from '../event.js';
import { TransitionHandler } from '../handler/transition.js';

/**
 * @template {import('./types.js').StateConfig} TStateConfig
 * @template {Record<string, any>} TContextAncestor
 */
export class BaseState {
	/**
	 * Action configuration from the user that is propagated to children
	 * @type {import('../runner/types.js').BaseRunnerConfig}
	 */
	#actionConfig = {};
	/**
	 * Actions from the user config
	 * @type {Record<string, import('../runner/action.js').ActionRunner<TStateConfig, TContextAncestor>>}
	 */
	#actions = {};
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	#always = [];
	#alwaysConfig;
	/**
	 * Condition configuration from the user that is propagated to children
	 * @type {import('../runner/types.js').BaseRunnerConfig}
	 */
	#conditionConfig = {};
	/**
	 * Conditions from the user config
	 * @type {Record<string, import('../runner/condition.js').ConditionRunner<TStateConfig, TContextAncestor>>}
	 */
	#conditions = {};
	#context;
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	#entry = [];
	#entryConfig;
	/** @type {StateEvent | null} */
	#event = null;
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	#exit = [];
	#exitConfig;
	#onConfig;
	/**
	 * Actions from all ancestor states and the config
	 * @type {Record<string, import('../runner/action.js').ActionRunner<TStateConfig, TContextAncestor>>}
	 */
	__allActions = {};
	/**
	 * Conditions from all ancestor states and the config
	 * @type {Record<string, import('../runner/condition.js').ConditionRunner<TStateConfig, TContextAncestor>>}
	 */
	__allConditions = {};

	/** @type {import('../runner/action.js').ActionRunner<TStateConfig, TContextAncestor> | null} */
	__action = null;
	/** @type {import('../runner/condition.js').ConditionRunner<TStateConfig, TContextAncestor> | null} */
	__condition = null;
	/**
	 * The active handler that is currently executing
	 *
	 * @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler) | null}
	 */
	__handler = null;
	/** @type {(import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]} */
	__handlerQueue = [];
	__initialized = false;
	__name = '';
	/** @type {import('./parent.js').ParentState<any, any> | null} */
	__parent = null;
	/** @type {Record<string, (import('../handler/effect.js').EffectHandler | import('../handler/transition.js').TransitionHandler)[]>} */
	__onHandler = {};
	/** @type {Set<(arg: BaseState<TStateConfig, TContextAncestor>) => any>} */
	__subscribers = new Set();

	/**
	 * @param {TStateConfig} stateConfig
	 */
	constructor(stateConfig) {
		this.#context =
			/** @type {Context<import('../context/types.js').ContextType<TStateConfig, Record<string, any>>, TContextAncestor>} */ (
				new Context(this)
			);
		this.__name = stateConfig.name || '';

		this.#alwaysConfig = stateConfig.always
			? normalizeHandlerConfig(stateConfig.always)
			: [];
		this.#entryConfig = stateConfig.entry
			? normalizeHandlerConfig(stateConfig.entry)
			: [];
		this.#exitConfig = stateConfig.exit
			? normalizeHandlerConfig(stateConfig.exit)
			: [];
		this.#onConfig = stateConfig.on || {};
	}
	/**
	 * @returns {Record<string, import('../runner/action.js').ActionRunner<TStateConfig, TContextAncestor>>}
	 */
	get __actions() {
		const actions = this.__parent?.__actions || {};
		for (const name in this.#actions) {
			if (Object.hasOwn(this.#actions, name)) {
				const action = this.#actions[name];
				if (!action.name) {
					action.__name = name;
				}
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
	 * @returns {Record<string, import('../runner/condition.js').ConditionRunner<TStateConfig, TContextAncestor>>}
	 */
	get __conditions() {
		const conditions = this.__parent?.__conditions || {};
		for (const name in this.#conditions) {
			if (Object.hasOwn(this.#conditions, name)) {
				const condition = this.#conditions[name];
				if (!condition.name) {
					condition.__name = name;
				}
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
		this.__initialized = true;
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
	/** @param {import('./types.js').BaseResolveConfig} [config] */
	__resolve(config) {
		if (config?.context) {
			for (const [key, value] of Object.entries(config.context)) {
				this.#context.__set(
					/** @type {any} */ (key),
					/** @type {any} */ (value),
				);
			}
		}
		if (config?.actionConfig) {
			if ('name' in config.actionConfig) {
				this.#actionConfig['name'] = config.actionConfig['name'];
			}
		}
		if (config?.actions) {
			for (const [name, action] of Object.entries(config.actions)) {
				this.#actions[name] =
					typeof action === 'function'
						? new ActionRunner({ run: action, ownerState: this })
						: new ActionRunner({ ...action, ownerState: this });
			}
		}
		if (config?.conditionConfig) {
			if ('name' in config.conditionConfig) {
				this.#conditionConfig['name'] = config.conditionConfig['name'];
			}
		}
		if (config?.conditions) {
			for (const [name, condition] of Object.entries(config.conditions)) {
				this.#conditions[name] =
					typeof condition === 'function'
						? new ConditionRunner({ run: condition, ownerState: this })
						: new ConditionRunner({ ...condition, ownerState: this });
			}
		}
	}
	__resolveConfig() {
		this.__allActions = this.__actions;
		this.__allConditions = this.__conditions;
		this.#context.__ownerState = this;

		for (const [index, handlerConfig] of this.#alwaysConfig.entries()) {
			const handler = createHandler({
				...handlerConfig,
				name: String(index),
				ownerState: this,
			});
			this.#always.push(handler);
		}

		for (const [event, handlers] of Object.entries(this.#onConfig)) {
			this.__onHandler[event] = normalizeHandlerConfig(handlers).map(
				(handlerConfig, i) => {
					return createHandler({
						...handlerConfig,
						name: String(i),
						ownerState: this,
					});
				},
			);
		}

		for (const [index, handlerConfig] of this.#entryConfig.entries()) {
			const handler = createHandler({
				...handlerConfig,
				name: String(index),
				ownerState: this,
			});
			this.#entry.push(handler);
		}

		for (const [index, handlerConfig] of this.#exitConfig.entries()) {
			const handler = createHandler({
				...handlerConfig,
				name: String(index),
				ownerState: this,
			});
			this.#exit.push(handler);
		}
	}
	__start() {
		if (!this.__initialized) {
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
					handler.transitionTo === path
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
		if (!this.__initialized) {
			throw Error(
				"Attempted to read context before calling 'state.resolve()'.",
			);
		}
		return this.#context;
	}
	/**
	 * @param {import('./types.js').CollectStateConfigs<TStateConfig>} eventName
	 * @param {any} [value]
	 */
	dispatch(eventName, value) {
		if (!this.__initialized) {
			throw Error('Attempted dispatch before resolving state');
		}

		const event = new StateEvent({
			name: /** @type {string} */ (eventName),
			value,
		});
		this.#event = event;
		this.__queueOnHandlers(/** @type {string} */ (eventName));
		this.__queueAlwaysHandlers();
		this.__executeHandlersLeafFirst();

		this.__callSubscribers();
		this.#event = null;
	}
	/** @returns {StateEvent} */
	get event() {
		const event = this.#event ?? this.__parent?.event;
		if (!event) {
			throw Error(`Attempted to access event outside event lifecycle.`);
		}
		return event;
	}
	get handler() {
		return this.__handler;
	}
	/** @param {string} name */
	isActiveEvent(name) {
		if (!this.__initialized) {
			throw Error(
				"Attempted to call 'state.isActiveEvent()' before calling 'state.resolve()'",
			);
		}
		return name in this.__onHandler && Boolean(this.__onHandler[name].length);
	}
	/**
	 * @param {string} path
	 * @return {boolean}
	 */
	matches(path) {
		if (!this.__initialized) return false;
		return Boolean(
			path === this.__name ||
				(this.__action && path === this.__action.path.join('.')) ||
				(this.__condition && path === this.__condition.path.join('.')) ||
				(this.__handler && path === this.__handler.path.join('.')),
		);
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
}
