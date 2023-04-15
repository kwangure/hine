import { CALL_SUBSCRIBERS, CONDITION_NAME, CONDITION_NOTIFY_AFTER, CONDITION_NOTIFY_BEFORE, CONDITION_OWNER, STATE_CONDITION } from './constants.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 */

function noop() {
	return true;
}

/**
 * @template {StateNode} [T=StateNode]
 */
export class Condition {
	#name = '';
	/** @type {StateNode | null} */
	#ownerState = null;
	/** @type {(arg: any) => boolean} */
	#run = noop;
	/** @type {boolean | undefined} */
	[CONDITION_NOTIFY_AFTER] = undefined;
	/** @type {boolean | undefined} */
	[CONDITION_NOTIFY_BEFORE] = undefined;

	/**
	 * @param {import('./types').ConditionConfig<T>} options
	 */
	constructor(options) {
		this.#name = options.name || '';
		if (typeof options.notifyAfter === 'boolean') {
			this[CONDITION_NOTIFY_AFTER] = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this[CONDITION_NOTIFY_BEFORE] = options.notifyBefore;
		}
		this.#run = options.run || noop;
	}
	#notifyAfter() {
		if (!this[CONDITION_NOTIFY_AFTER]) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	#notifyBefore() {
		if (!this[CONDITION_NOTIFY_BEFORE]) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	get name() {
		return this.#name;
	}
	/**
	 * @param {any} [value]
	 */
	run(value) {
		if (!this.#ownerState) return;
		this.#ownerState[STATE_CONDITION] = this;
		this.#notifyBefore();
		const result = this.#run.call(this.#ownerState, value);
		this.#notifyAfter();
		this.#ownerState[STATE_CONDITION] = null;
		return result;
	}
	toJSON() {
		return {
			name: this.#name,
		};
	}
	/** @param {string} value */
	set [CONDITION_NAME](value) {
		this.#name = value;
	}
	/** @param {import('./types').StateNode} owner */
	set [CONDITION_OWNER](owner) {
		this.#ownerState = owner;
	}
}
