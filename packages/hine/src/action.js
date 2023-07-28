import {
	ACTION_NOTIFY_AFTER,
	ACTION_NOTIFY_BEFORE,
	STATE_ACTION,
} from './constants.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 */

function noop() {}

export class Action {
	/** @type {(arg: any) => any} */
	#run = noop;
	#type = /** @type {const} */ ('action');
	/** @type {StateNode | null} */
	__ownerState = null;

	/** @private */
	__name = '';

	/** @type {boolean | undefined} */
	[ACTION_NOTIFY_AFTER] = undefined;
	/** @type {boolean | undefined} */
	[ACTION_NOTIFY_BEFORE] = undefined;
	/**
	 * @param {import('./types').ActionConfig} options
	 */
	constructor(options) {
		this.__name = options.name || '';
		if (typeof options.notifyAfter === 'boolean') {
			this[ACTION_NOTIFY_AFTER] = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this[ACTION_NOTIFY_BEFORE] = options.notifyBefore;
		}
		this.#run = options.run;
	}
	#notifyAfter() {
		if (!this[ACTION_NOTIFY_AFTER]) return;
		this.__ownerState?.__callSubscribers();
	}
	#notifyBefore() {
		if (!this[ACTION_NOTIFY_BEFORE]) return;
		this.__ownerState?.__callSubscribers();
	}
	get event() {
		if (!this.__ownerState) {
			const path = this.path.join('.');
			throw Error(
				`Attempted to read 'action.event' at '${path}' before calling 'state.start()'.`,
			);
		}
		return this.__ownerState?.event;
	}
	get name() {
		return this.__name;
	}
	get ownerState() {
		if (!this.__ownerState) {
			throw Error('Attempted to read ownerState before calling state.start().');
		}
		return this.__ownerState;
	}
	/** @type {string[]} */
	get path() {
		return this.__ownerState
			? [...this.__ownerState.path, `(${this.__name})`]
			: [`(${this.__name})`];
	}
	run() {
		if (!this.__ownerState) return;
		this.__ownerState[STATE_ACTION] = this;
		this.#notifyBefore();
		const result = this.#run.call(undefined, this);
		this.#notifyAfter();
		this.__ownerState[STATE_ACTION] = null;
		return result;
	}
	toJSON() {
		return {
			name: this.__name,
			path: this.path,
			type: this.#type,
		};
	}
	get type() {
		return this.#type;
	}
}
