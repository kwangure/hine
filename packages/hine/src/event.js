export class StateEvent {
	#name;
	#time;
	/** @type {unknown} */
	#value;
	/**
	 * @param {import("./types").EventOptions} options
	 */
	constructor({ name, value }) {
		this.#name = name;
		this.#value = value;
		this.#time = new Date().getTime();
	}
	get name() {
		return this.#name;
	}
	get time() {
		return this.#time;
	}
	get value() {
		return this.#value;
	}
}
