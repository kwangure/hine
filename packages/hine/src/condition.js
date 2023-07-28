import { STATE_CONDITION } from './constants.js';

/**
 * @typedef {import('./types').StateNode} StateNode
 */

function noop() {
	return true;
}

export class Condition {
	/** @type {(arg: any) => boolean} */
	#run = noop;
	#type = /** @type {const} */ ('condition');
	/** @type {StateNode | null} */
	__ownerState = null;
	/** @private */
	__name = '';
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
		this.__name = options.name || '';
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
		this.__ownerState?.__callSubscribers();
	}
	#notifyBefore() {
		if (!this.__notifyBefore) return;
		this.__ownerState?.__callSubscribers();
	}
	get event() {
		if (!this.__ownerState) {
			const path = this.path.join('.');
			throw Error(
				`Attempted to read 'condition.event' at '${path}' before calling 'state.start()'.`,
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
			? [...this.__ownerState.path, `?${this.__name}`]
			: [`?${this.__name}`];
	}
	run() {
		if (!this.__ownerState) return false;
		this.__ownerState[STATE_CONDITION] = this;
		this.#notifyBefore();
		const result = this.#run.call(undefined, this);
		this.#notifyAfter();
		this.__ownerState[STATE_CONDITION] = null;
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
