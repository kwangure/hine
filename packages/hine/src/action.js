import {
	ACTION_NAME,
	ACTION_NOTIFY_AFTER,
	ACTION_NOTIFY_BEFORE,
	ACTION_OWNER,
	CALL_SUBSCRIBERS,
	STATE_ACTION,
} from './constants.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 */

function noop() {}

export class Action {
	#name = '';
	/** @type {StateNode | null} */
	#ownerState = null;
	/** @type {(arg: any) => any} */
	#run = noop;
	#type = /** @type {const} */ ('action');
	/** @type {boolean | undefined} */
	[ACTION_NOTIFY_AFTER] = undefined;
	/** @type {boolean | undefined} */
	[ACTION_NOTIFY_BEFORE] = undefined;
	/**
	 * @param {import('./types').ActionConfig} options
	 */
	constructor(options) {
		this.#name = options.name || '';
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
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	#notifyBefore() {
		if (!this[ACTION_NOTIFY_BEFORE]) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	get event() {
		if (!this.#ownerState) {
			throw Error(
				`Attempted to read action.event in '${
					this.#name
				}' before calling state.start().`,
			);
		}
		return this.#ownerState?.event;
	}
	get name() {
		return this.#name;
	}
	get ownerState() {
		if (!this.#ownerState) {
			throw Error('Attempted to read ownerState before calling state.start().');
		}
		return this.#ownerState;
	}
	/** @type {string[]} */
	get path() {
		return this.#ownerState
			? [...this.#ownerState.path, `(${this.#name})`]
			: [`(${this.#name})`];
	}
	run() {
		if (!this.#ownerState) return;
		this.#ownerState[STATE_ACTION] = this;
		this.#notifyBefore();
		const result = this.#run.call(undefined, this);
		this.#notifyAfter();
		this.#ownerState[STATE_ACTION] = null;
		return result;
	}
	toJSON() {
		return {
			name: this.#name,
			path: this.path,
			type: this.#type,
		};
	}
	get type() {
		return this.#type;
	}
	/** @param {string} value */
	set [ACTION_NAME](value) {
		this.#name = value;
	}
	/** @param {StateNode} owner */
	set [ACTION_OWNER](owner) {
		this.#ownerState = owner;
	}
}
