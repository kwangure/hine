import {
	CALL_SUBSCRIBERS,
	CONDITION_NAME,
	CONDITION_OWNER,
	STATE_CONDITION,
} from './constants.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 */

function noop() {
	return true;
}

export class Condition {
	#name = '';
	/** @type {StateNode | null} */
	#ownerState = null;
	/** @type {(arg: any) => boolean} */
	#run = noop;
	#type = /** @type {const} */ ('condition');

	/**
	 * @private
	 * @type {boolean | undefined}
	 */
	__notifyAfter = undefined;
	/**
	 * @private
	 * @type {boolean | undefined}
	 */
	__notifyBefore = undefined;

	/**
	 * @param {import('./types').ConditionConfig} options
	 */
	constructor(options) {
		this.#name = options.name || '';
		if (typeof options.notifyAfter === 'boolean') {
			this.__notifyAfter = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this.__notifyBefore = options.notifyBefore;
		}
		this.#run = options.run || noop;
	}
	#notifyAfter() {
		if (!this.__notifyAfter) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	#notifyBefore() {
		if (!this.__notifyBefore) return;
		this.#ownerState?.[CALL_SUBSCRIBERS]();
	}
	get event() {
		if (!this.#ownerState) {
			const path = this.path.join('.');
			throw Error(
				`Attempted to read 'condition.event' at '${path}' before calling 'state.start()'.`,
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
			? [...this.#ownerState.path, `?${this.#name}`]
			: [`?${this.#name}`];
	}
	run() {
		if (!this.#ownerState) return false;
		this.#ownerState[STATE_CONDITION] = this;
		this.#notifyBefore();
		const result = this.#run.call(undefined, this);
		this.#notifyAfter();
		this.#ownerState[STATE_CONDITION] = null;
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
	set [CONDITION_NAME](value) {
		this.#name = value;
	}
	/** @param {StateNode} owner */
	set [CONDITION_OWNER](owner) {
		this.#ownerState = owner;
	}
}
