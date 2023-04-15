import { ACTION_NAME, ACTION_NOTIFY_AFTER, ACTION_NOTIFY_BEFORE, ACTION_OWNER, CALL_SUBSCRIBERS, STATE_ACTION } from './constants.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 * @typedef {import('./base').BaseState} BaseState
 */

function noop() {}

/**
 * @template {BaseState} [T=BaseState]
 */
export class Action {
	#name = '';
	/** @type {StateNode | null} */
	#ownerState = null;
	/** @type {(arg: any) => any} */
	#run = noop;
	/** @type {boolean | undefined} */
	[ACTION_NOTIFY_AFTER] = undefined;
	/** @type {boolean | undefined} */
	[ACTION_NOTIFY_BEFORE] = undefined;
	/**
	 * @param {import('./types').ActionConfig<T>} options
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
	get name() {
		return this.#name;
	}
	/**
	 * @param {any} value
	 */
	run(value) {
		if (!this.#ownerState) return;
		this.#ownerState[STATE_ACTION] = this;
		this.#notifyBefore();
		this.#run.call(this.#ownerState, value);
		this.#notifyAfter();
		this.#ownerState[STATE_ACTION] = null;
	}
	toJSON() {
		return {
			name: this.#name,
		};
	}
	/** @param {string} value */
	set [ACTION_NAME](value) {
		this.#name = value;
	}
	/** @param {StateNode | BaseState} owner */
	set [ACTION_OWNER](owner) {
		this.#ownerState = /** @type {StateNode} */(owner);
	}
}


