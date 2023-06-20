export class StateEvent {
	#name;
	#time;
	/**
	 * @param {string} name
	 */
	constructor(name) {
		this.#name = name;
		this.#time = new Date().getTime();
	}
	get name() {
		return this.#name;
	}
	get time() {
		return this.#time;
	}
}
