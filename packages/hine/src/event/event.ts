import type { StateNode } from '../states/types';

const CURRENT_TARGET_SYMBOL = Symbol('currenttarget');

export class StateEvent {
	#detail;
	#target;
	#timeStamp;
	#type;
	[CURRENT_TARGET_SYMBOL]: StateNode;

	constructor(type: string, target: StateNode, detail: unknown) {
		this[CURRENT_TARGET_SYMBOL] = target;
		this.#detail = detail;
		this.#target = target;
		this.#timeStamp = Date.now();
		this.#type = type;
	}
	get currentTarget() {
		return this[CURRENT_TARGET_SYMBOL];
	}
	get detail() {
		return this.#detail;
	}
	get target() {
		return this.#target;
	}
	get timeStamp() {
		return this.#timeStamp;
	}
	get type() {
		return this.#type;
	}
}

export function setCurrentTarget(event: StateEvent, node: StateNode) {
	event[CURRENT_TARGET_SYMBOL] = node;
}
