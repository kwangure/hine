import { BaseHandler } from './base.js';

export class TransitionHandler extends BaseHandler {
	/** @type {import('../state/types.js').StateNode | null} */
	#goto = null;
	#type = /** @type {const} */ ('transition');
	__gotoName;

	/**
	 * @param {import('./types.js').TransitionHandlerConfig} options
	 */
	constructor(options) {
		super(options);
		this.__gotoName = options.goto;
	}
	/**
	 * @param {{
	 *   name: string;
	 *   ownerState: import("../state/base.js").BaseState;
	 * }} options
	 */
	__resolve(options) {
		super.__resolve(options);
		this.__resolveTransition();
	}
	__resolveTransition() {
		const parent = this.__ownerState?.__parent;
		if (!parent) {
			let message = '';
			if (this.path.some((segment) => Boolean(segment))) {
				const path = this.path.join('.');
				message += `State '${path}' references unknown transition target '${this.__gotoName}'.`;
				message += ` '${path}' does not have sibling states.`;
			} else {
				message += `State references unknown transition target '${this.__gotoName}'.`;
				message += ` It does not have sibling states.`;
			}
			throw Error(message);
		}
		const to = parent.__children.get(this.__gotoName);
		if (!to) {
			let message = '';
			if (this.path.some((segment) => Boolean(segment))) {
				const path = this.path.join('.');
				message += `State '${path}' references unknown transition target '${this.__gotoName}'.`;
			} else {
				message += `State references unknown transition target '${this.__gotoName}'.`;
			}
			const siblings = Array.from(parent.__children.keys());
			if (siblings.length) {
				message += `Expected one of: ${siblings.join(', ')}.`;
			}
			throw Error(message);
		}
		this.#goto = to;
	}
	run() {
		const from = this.__ownerState;
		const to = this.#goto;
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
		const to = this.#goto;
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
	/**
	 * @returns {import('./types.js').TransitionHandlerJSON}
	 */
	toJSON() {
		return {
			type: this.#type,
			name: this.__name,
			goto: this.#goto?.name,
			if: this.__condition?.name,
			run: this.__actions.map((action) => action.name),
			path: this.path,
		};
	}
	get transitionTo() {
		return this.#goto;
	}
	get type() {
		return this.#type;
	}
}
