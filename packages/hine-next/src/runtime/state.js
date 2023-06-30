import { formatExpectedList } from './error.js';
import { Handler } from './handler.js';

export class State {
	__monitorsResolved = false;
	/**
	 * Resovled handlers to execute while entering state
	 *
	 * @type {Handler[]}
	 */
	__entryHandlers = [];
	/**
	 * State action definitions from the user
	 *
	 * @type {Record<string, import('./action.js').Action>}
	 */
	__monitorActionsConfig = {};
	/**
	 * Specified state handlers to execute while entering state
	 *
	 * @type {Record<string, import('./action.js').Action>}
	 */
	/** @type {import('../types.js').EntryHandlerConfig[]} */
	__monitorEntryConfig = [];
	/** @type {import('./handler.js').Handler[]} */
	__handlerQueue = [];
	/** @param {any} [value] */
	__executeHandlers(value) {
		for (const handler of this.__handlerQueue) {
			handler.runActions(value);
		}
		// If the handler queue was not emptied because a transition terminated
		// handler execution, we need to now free it
		this.__handlerQueue.length = 0;
	}
	/** @param {any} [value] */
	__executeHandlersLeafFirst(value) {
		this.__executeHandlers(value);
	}
	__queueEntryHandlers() {
		this.__handlerQueue.push(...this.__entryHandlers);
	}
	/** @param {import("../types.js").EntryHandlerConfig} handler */
	__resolveActions(handler) {
		const actions = [];
		for (const name of handler.actions || []) {
			const action = this.__monitorActionsConfig[name];
			if (!action) {
				const actions = Object.keys(this.__monitorActionsConfig);
				throw Error(
					`State references unknown action '${name}'. ${formatExpectedList(
						actions,
					)}`,
				);
			}
			actions.push(action);
		}
		return actions;
	}
	/**
	 * @param {import("../types.js").EntryHandlerConfig} handler
	 * @param {string} name
	 */
	__resolveHandler(handler, name) {
		const actions = this.__resolveActions(handler);
		return new Handler({
			actions,
			name,
		});
	}
	__resolveMonitors() {
		for (const [index, handler] of this.__monitorEntryConfig.entries()) {
			this.__entryHandlers.push(this.__resolveHandler(handler, String(index)));
		}
	}

	/** @param {import('../types.js').MonitorConfig} monitorConfig */
	monitor(monitorConfig) {
		if (monitorConfig.actions) {
			for (const [name, action] of Object.entries(monitorConfig.actions)) {
				this.__monitorActionsConfig[name] = action;
			}
		}
		if (monitorConfig.entry) {
			for (const handler of monitorConfig.entry) {
				this.__monitorEntryConfig.push(handler);
			}
		}
	}
	start() {
		if (!this.__monitorsResolved) {
			this.__resolveMonitors();
		} else {
			this.__monitorsResolved = true;
		}

		this.__queueEntryHandlers();
		this.__executeHandlersLeafFirst();
	}
}
