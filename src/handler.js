import {
	CALL_SUBSCRIBERS,
	EXECUTE_HANDLERS_LEAF_FIRST,
	EXECUTE_HANDLERS_ROOT_FIRST,
	HANDLER_NOTIFY_AFTER,
	HANDLER_NOTIFY_BEFORE,
	HANDLER_OWNER,
	HANDLER_QUEUE,
	INITIALIZE,
	QUEUE_ALWAYS_HANDLERS,
	QUEUE_ENTRY_HANDLERS,
	QUEUE_EXIT_HANDLERS,
	STATE_ACTIVE,
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
	/** @type {StateNode | null} */
	#ownerState = null;
	/** @type {StateNode | null} */
	#transitionTo = null;
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
		this.#actions = options.actions;
		this.#condition = options.condition;
		this.#ownerState = /** @type {StateNode} */ (options.ownerState);
		this.#transitionTo = options.transitionTo;
	}
	#notifyAfter() {
		if (!this[HANDLER_NOTIFY_AFTER]) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	#notifyBefore() {
		if (!this[HANDLER_NOTIFY_BEFORE]) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	/**
	 * @param {any} value
	 */
	run(value) {
		const from = this.#ownerState;
		// This should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');

		this.#notifyBefore();
		if (this.#condition && !this.#condition.run(value)) {
			return false;
		}

		if (this.#transitionTo) {
			const to = this.#transitionTo;
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
		} else {
			// transition actions for the handler
			for (const action of this.#actions) {
				action.run(value);
			}
		}

		this.#notifyAfter();
		return Boolean(this.#transitionTo);
	}
	/** @param {StateNode | BaseState} owner */
	set [HANDLER_OWNER](owner) {
		this.#ownerState = /** @type {StateNode} */(owner);
	}
}

