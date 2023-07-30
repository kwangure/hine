import { BaseHandler } from './base.js';

export class TransitionHandler extends BaseHandler {
	/** @type {import('../types.js').StateNode | null} */
	#transitionTo = null;
	#type = /** @type {const} */ ('transition');

	/**
	 * @param {import('../types').TransitionHandlerConfig} options
	 */
	constructor(options) {
		super(options);
		this.#transitionTo = options.transitionTo || null;
	}
	run() {
		const from = this.__ownerState;
		const to = this.#transitionTo;
		// These should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');
		if (!to) throw Error('Missing handler transitionTo');

		from.__handler = this;
		this.__notifyBefore();
		const shouldExecute = !this.condition || this.condition.run();
		if (shouldExecute) {
			from.__handlerQueue.length = 0;
			// exit actions for the current state
			from.__queueExitHandlers();
			from.__executeHandlersLeafFirst();

			// transition actions for the handler
			for (const action of this.__actions) {
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
		this.__notifyAfter();
		from.__handler = null;
		return shouldExecute;
	}
	*step() {
		const from = this.__ownerState;
		const to = this.#transitionTo;
		// These should never happen. They're mostly to help TypeScript out
		if (!from) throw Error('Missing handler ownerState');
		if (!to) throw Error('Missing handler transitionTo');

		from.__handler = this;
		this.__notifyBefore();
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
			for (const action of this.__actions) {
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
		this.__notifyAfter();
		from.__handler = null;
		return shouldExecute;
	}
	toJSON() {
		return {
			type: this.#type,
			name: this.__name,
			transitionTo: this.#transitionTo?.name,
			condition: this.__condition?.name,
			actions: this.__actions.map((action) => action.name),
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
