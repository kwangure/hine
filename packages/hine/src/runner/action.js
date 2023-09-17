import { BaseRunner } from './base.js';

export class ActionRunner extends BaseRunner {
	/** @type {(arg: any) => any} */
	#run;
	#type = /** @type {const} */ ('action');
	/**
	 * @param {import('./types.js').ActionRunnerConfig & {
	 *     ownerState: import('../state/base.js').BaseState
	 * }} options
	 */
	constructor(options) {
		super(options);
		this.#run = options.run;
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
				`Attempted to read 'action.event' at '${path}' before calling 'state.resolve()'.`,
			);
		}

		return this.__ownerState?.event;
	}

	get ownerState() {
		return /** @type {import('../state/types.js').StateNode} */ (
			this.__ownerState
		);
	}
	/** @type {string[]} */
	get path() {
		return this.__ownerState
			? [...this.__ownerState.path, `(${this.__name})`]
			: [`(${this.__name})`];
	}
	run() {
		if (!this.__ownerState) return;
		this.__ownerState.__action = this;
		this.#notifyBefore();
		const result = this.#run.call(undefined, this);
		this.#notifyAfter();
		this.__ownerState.__action = null;
		return result;
	}
	/**
	 * @returns {import('../types.js').ActionJSON}
	 */
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
