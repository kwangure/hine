// @ts-ignore
import { bubble, get_current_component, listen } from 'svelte/internal';

export function createEventForwarder() {
	const component = get_current_component();
	/**
	 * @param {EventTarget} node
	 */
	return (node) => {
		for (const event in component.$$.callbacks) {
			if ({}.hasOwnProperty.call(component.$$.callbacks, event)) {
				const removeListener = listen(
					node,
					event,
					(/** @type {any} */ event) => {
						bubble(component, event);
					},
				);
				component.$$.on_destroy.push(removeListener);
			}
		}
	};
}
