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
	#transitionTo = null;
	#type = /** @type {const} */ ('handler');
	/** @type {StateNode | null} */
	__ownerState = null;
	/** @type {boolean | undefined} */
	__notifyBefore = undefined;
	/** @type {boolean | undefined} */
	__notifyAfter = undefined;
	/**
	 * @param {import('./types').HandlerConfig<T>} options
	 */
	constructor(options) {
		if (typeof options.notifyAfter === 'boolean') {
			this.__notifyAfter = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this.__notifyBefore = options.notifyBefore;
		}
		this.#actions = options.actions || [];
		this.#condition = options.condition || null;
		this.#name = options.name || '';
		this.__ownerState = /** @type {StateNode} */ (options.ownerState);
		this.#transitionTo = options.transitionTo || null;
	}
	#notifyAfter() {
		if (!this.__notifyAfter) return;
		this.__ownerState?.__callSubscribers();
	}
	#notifyBefore() {
		if (!this.__notifyBefore) return;
		this.__ownerState?.__callSubscribers();
	}
	get condition() {
		return this.#condition;
	}
	get name() {
		return this.#name;
	}
	/** @type {string[]} */
	get path() {
		return this.__ownerState
			? [...this.__ownerState.path, `[${this.#name}]`]
			: [`[${this.#name}]`];
	}
	runActions() {
		// This should never happen. Its mostly to help TypeScript out
		if (!this.__ownerState) throw Error('Missing handler ownerState');

		this.__ownerState.__handler = this;
		this.#notifyBefore();
		if (!this.condition || this.condition.run()) {
			for (const action of this.#actions) {
				action.run();
			}
		}
		this.#notifyAfter();
		this.__ownerState.__handler = null;
	}
	runTransition() {
		const from = this.__ownerState;
		const to = this.#transitionTo;
		// These should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');
		if (!to) throw Error('Missing handler transitionTo');

		from.__handler = this;
		this.#notifyBefore();
		const shouldExecute = !this.condition || this.condition.run();
		if (shouldExecute) {
			from.__handlerQueue.length = 0;
			// exit actions for the current state
			from.__queueExitHandlers();
			from.__executeHandlersLeafFirst();

			// transition actions for the handler
			for (const action of this.#actions) {
				action.run();
			}
			// This should never happen. They're mostly to help TypeScript out
			if (!from.parent) throw Error('Missing state parent');
			// change the active nested state for parent state
			from.parent.__state = to;
			// set initial state from transitionTo to leaves
			to.__initialize();

			to.__queueEntryHandlers();
			to.__executeHandlersRootFirst();
			to.__queueAlwaysHandlers();
			to.__executeHandlersRootFirst();
		}
		this.#notifyAfter();
		from.__handler = null;
		return shouldExecute;
	}
	*stepActions() {
		this.#notifyBefore();
		let shouldExecute = false;
		if (this.condition) {
			yield this.condition;
			shouldExecute = this.condition.run();
		}
		if (shouldExecute) {
			for (const action of this.#actions) {
				yield action;
				action.run();
			}
		}
		this.#notifyAfter();
	}
	*stepTransition() {
		const from = this.__ownerState;
		const to = this.#transitionTo;
		// These should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');
		if (!to) throw Error('Missing handler transitionTo');

		from.__handler = this;
		this.#notifyBefore();
		let shouldExecute = false;
		if (this.condition) {
			yield this.condition;
			shouldExecute = this.condition.run();
		}
		if (shouldExecute) {
			from.__handlerQueue.length = 0;
			// exit actions for the current state
			from.__queueExitHandlers();
			from.__executeHandlersLeafFirst();

			// transition actions for the handler
			for (const action of this.#actions) {
				yield action;
				action.run();
			}
			// This should never happen. They're mostly to help TypeScript out
			if (!from.parent) throw Error('Missing state parent');
			// change the active nested state for parent state
			from.parent.__state = to;
			// set initial state from transitionTo to leaves
			to.__initialize();

			to.__queueEntryHandlers();
			to.__executeHandlersRootFirst();

			to.__queueAlwaysHandlers();
			to.__executeHandlersRootFirst();
		}
		this.#notifyAfter();
		from.__handler = null;
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
