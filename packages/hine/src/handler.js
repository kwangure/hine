import {
	CALL_SUBSCRIBERS,
	EXECUTE_HANDLERS_LEAF_FIRST,
	EXECUTE_HANDLERS_ROOT_FIRST,
	HANDLER_NOTIFY_AFTER,
	HANDLER_NOTIFY_BEFORE,
	HANDLER_QUEUE,
	INITIALIZE,
	QUEUE_ALWAYS_HANDLERS,
	QUEUE_ENTRY_HANDLERS,
	QUEUE_EXIT_HANDLERS,
	STATE_ACTIVE,
	STATE_HANDLER,
} from './constants.js';

/**
 * @typedef {import('./action').Action} Action
 * @typedef {import('./types').StateNode} StateNode
 * @typedef {import('./base').BaseState} BaseState
 */

/**
 * @template {StateNode} [T=StateNode]
 */
export class Handler {
	/** @type {Action[]} */
	#actions = [];
	/** @type {import('./condition').Condition | null} */
	#condition = null;
	#name;
	/** @type {StateNode | null} */
	#ownerState = null;
	/** @type {StateNode | null} */
	#transitionTo = null;
	#type = /** @type {const} */('handler');
	/** @type {boolean | undefined} */
	[HANDLER_NOTIFY_AFTER] = undefined;
	/** @type {boolean | undefined} */
	[HANDLER_NOTIFY_BEFORE] = undefined;
	/**
	 * @param {import('./types').HandlerConfig<T>} options
	 */
	constructor(options) {
		if (typeof options.notifyAfter === 'boolean') {
			this[HANDLER_NOTIFY_AFTER] = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this[HANDLER_NOTIFY_BEFORE] = options.notifyBefore;
		}
		this.#actions = options.actions || [];
		this.#condition = options.condition || null;
		this.#name = options.name || '';
		this.#ownerState = /** @type {StateNode} */ (options.ownerState);
		this.#transitionTo = options.transitionTo || null;
	}
	#notifyAfter() {
		if (!this[HANDLER_NOTIFY_AFTER]) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	#notifyBefore() {
		if (!this[HANDLER_NOTIFY_BEFORE]) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	get condition() {
		return this.#condition;
	}
	get name() {
		return this.#name;
	}
	/** @type {string[]} */
	get path() {
		return this.#ownerState
			? [...this.#ownerState.path, `[${this.#name}]`]
			: [`[${this.#name}]`];
	}
	/**
	 * @param {any} value
	 */
	runActions(value) {
		// This should never happen. Its mostly to help TypeScript out
		if (!this.#ownerState) throw Error('Missing handler ownerState');

		this.#ownerState[STATE_HANDLER] = this;
		this.#notifyBefore();
		if (!this.condition || this.condition.run(value)) {
			for (const action of this.#actions) {
				action.run(value);
			}
		}
		this.#notifyAfter();
		this.#ownerState[STATE_HANDLER] = null;
	}
	/**
	 * @param {any} value
	 */
	runTransition(value) {
		const from = this.#ownerState;
		const to = this.#transitionTo;
		// These should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');
		if (!to) throw Error('Missing handler transitionTo');

		from[STATE_HANDLER] = this;
		this.#notifyBefore();
		const shouldExecute = !this.condition || this.condition.run(value);
		if (shouldExecute) {
			from[HANDLER_QUEUE].length = 0;
			// exit actions for the current state
			from[QUEUE_EXIT_HANDLERS]();
			from[EXECUTE_HANDLERS_LEAF_FIRST](value);

			// transition actions for the handler
			for (const action of this.#actions) {
				action.run(value);
			}
			// This should never happen. They're mostly to help TypeScript out
			if (!from.parent) throw Error('Missing state parent');
			// change the active nested state for parent state
			from.parent[STATE_ACTIVE] = to;
			// set initial state from transitionTo to leaves
			to[INITIALIZE]();

			to[QUEUE_ENTRY_HANDLERS]();
			to[EXECUTE_HANDLERS_ROOT_FIRST](value);

			to[QUEUE_ALWAYS_HANDLERS]();
			to[EXECUTE_HANDLERS_ROOT_FIRST](value);
		}
		this.#notifyAfter();
		from[STATE_HANDLER] = null;
		return shouldExecute;
	}
	/**
	 * @param {any} value
	 */
	* stepActions(value) {
		this.#notifyBefore();
		let shouldExecute = false;
		if (this.condition) {
			yield this.condition;
			shouldExecute = this.condition.run(value);
		}
		if (shouldExecute) {
			for (const action of this.#actions) {
				yield action;
				action.run(value);
			}
		}
		this.#notifyAfter();
	}
	/**
	 * @param {any} value
	 */
	* stepTransition(value) {
		const from = this.#ownerState;
		const to = this.#transitionTo;
		// These should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');
		if (!to) throw Error('Missing handler transitionTo');

		from[STATE_HANDLER] = this;
		this.#notifyBefore();
		let shouldExecute = false;
		if (this.condition) {
			yield this.condition;
			shouldExecute = this.condition.run(value);
		}
		if (shouldExecute) {
			from[HANDLER_QUEUE].length = 0;
			// exit actions for the current state
			from[QUEUE_EXIT_HANDLERS]();
			from[EXECUTE_HANDLERS_LEAF_FIRST](value);

			// transition actions for the handler
			for (const action of this.#actions) {
				yield action;
				action.run(value);
			}
			// This should never happen. They're mostly to help TypeScript out
			if (!from.parent) throw Error('Missing state parent');
			// change the active nested state for parent state
			from.parent[STATE_ACTIVE] = to;
			// set initial state from transitionTo to leaves
			to[INITIALIZE]();

			to[QUEUE_ENTRY_HANDLERS]();
			to[EXECUTE_HANDLERS_ROOT_FIRST](value);

			to[QUEUE_ALWAYS_HANDLERS]();
			to[EXECUTE_HANDLERS_ROOT_FIRST](value);
		}
		this.#notifyAfter();
		from[STATE_HANDLER] = null;
		return shouldExecute;
	}
	toJSON() {
		return {
			type: this.#type,
			name: this.#name,
			transitionTo: this.#transitionTo?.name,
			condition: this.#condition?.name,
			actions: this.#actions.map((action) => action.name),
			path: this.path,
		};
	}
	get transitionTo() {
		return this.#transitionTo;
	}
	get type() {
		return this.#type;
	}
}

