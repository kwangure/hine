function noop() {}

export class Action {
	/** @type {(arg: any) => any} */
	#run = noop;
	#type = /** @type {const} */ ('action');
	/** @type {import('./state/base.js').BaseState | null} */
	__ownerState = null;
	__name = '';
	/** @type {boolean | undefined} */
	__notifyAfter = undefined;
	/** @type {boolean | undefined} */
	__notifyBefore = undefined;
	/**
	 * @param {import('./types').ActionConfig} options
	 */
	constructor(options) {
		this.__name = options.name || '';
		if (typeof options.notifyAfter === 'boolean') {
			this.__notifyAfter = options.notifyAfter;
		}
		if (typeof options.notifyBefore === 'boolean') {
			this.__notifyBefore = options.notifyBefore;
		}
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
		return /** @type {import('./state/types').StateNode} */ (this.__ownerState);
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
	 * @returns {import('./types').ActionJSON}
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
