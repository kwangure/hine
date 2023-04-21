import { BaseState } from './base.js';
import { STATE_SUBSCRIBERS } from './constants.js';

/**
 * @typedef {import('./types.js').AlwaysHandlerConfig} AlwaysHandlerConfig
 * @typedef {import('./types.js').DispatchHandlerConfig} DispatchHandlerConfig
 * @typedef {import('./types.js').EntryHandlerConfig} EntryHandlerConfig
 * @typedef {import('./types.js').ExitHandlerConfig} ExitHandlerConfig
 *
 * @typedef {import('./types.js').AlwaysHandler} AlwaysHandler
 * @typedef {import('./types.js').DispatchHandler} DispatchHandler
 * @typedef {import('./types.js').EntryHandler} EntryHandler
 * @typedef {import('./types.js').ExitHandler} ExitHandler
 * @typedef {import('./types.js').Handler} Handler
 *
 * @typedef {import('./compound.js').CompoundState} CompoundState
 */

export class AtomicState extends BaseState {
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this[STATE_SUBSCRIBERS].add(/** @type {(arg: BaseState) => any} */(fn));
		return () => {
			this[STATE_SUBSCRIBERS].delete(/** @type {(arg: BaseState) => any} */(fn));
		};
	}
	/**
	 * @returns {import('./types').AtomicStateJSON}
	 */
	toJSON() {
		return {
			name: this.name,
			type: 'atomic',
		};
	}
}
