import { BaseRunner } from './base.js';

/**
 * @template {import('../state/types.js').StateConfig} TStateConfig
 * @template {Record<string, import('../context/types.js').ContextTransformer>} TContextAncestor
 * @extends {BaseRunner<TStateConfig, TContextAncestor>}
 */
export class ConditionRunner extends BaseRunner {
	/** @type {(arg: any) => boolean} */
	#run;
	#type = /** @type {const} */ ('condition');

	/**
	 * @param {import('./types.js').ConditionRunnerConfig<TStateConfig, TContextAncestor> & {
	 *     ownerState: import('../state/base.js').BaseState<TStateConfig, TContextAncestor>
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
				`Attempted to read 'condition.event' at '${path}' before calling 'state.resolve()'.`,
			);
		}

		return this.__ownerState?.event;
	}
	get ownerState() {
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
		this.__ownerState.__condition = this;
		this.#notifyBefore();
		const result = this.#run.call(undefined, this);
		this.#notifyAfter();
		this.__ownerState.__condition = null;
		return result;
	}
	/**
	 * @returns {import('./types.js').ConditionJSON}
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
