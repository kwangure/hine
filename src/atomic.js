import { BaseState } from './base.js';
import { STATE_SUBSCRIBERS } from './constants.js';

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
