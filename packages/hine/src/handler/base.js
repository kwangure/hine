/**
 * @typedef {import('../types').StateNode} StateNode
 */

export class BaseHandler {
	/** @type {import('../action').Action[]} */
	__actions;
	/** @type {import('../condition').Condition | null} */
	__condition = null;
	__name;
	/** @type {import('../base.js').BaseState | null} */
	__ownerState = null;
	/** @type {boolean | undefined} */
	__shouldNotifyBefore = undefined;
	/** @type {boolean | undefined} */
	__shouldNotifyAfter = undefined;
	/**
	 * @param {import('../types').EffectHandlerConfig} options
	 */
	constructor(options) {
		if (typeof options.notifyAfter === 'boolean') {
			this.__shouldNotifyAfter = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this.__shouldNotifyBefore = options.notifyBefore;
		}
		this.__actions = options.actions || [];
		this.__condition = options.condition || null;
		this.__name = options.name || '';
		if (options.ownerState) this.__ownerState = options.ownerState;
	}
	__notifyAfter() {
		if (!this.__shouldNotifyAfter) return;
		this.__ownerState?.__callSubscribers();
	}
	__notifyBefore() {
		if (!this.__shouldNotifyBefore) return;
		this.__ownerState?.__callSubscribers();
	}
	get condition() {
		return this.__condition;
	}
	get name() {
		return this.__name;
	}
	/** @type {string[]} */
	get path() {
		return this.__ownerState
			? [...this.__ownerState.path, `[${this.__name}]`]
			: [`[${this.__name}]`];
	}
}
