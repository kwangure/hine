import { getFocusableElements } from '../dom/dom.js';

/**
 * @param {HTMLElement} node
 * @param {{ shouldTrapFocus?: () => boolean }} [options]
 */
export function focustrap(node, options) {
	const shouldTrapFocus = options?.shouldTrapFocus || (() => true);

	/**
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		if (!shouldTrapFocus()) return;
		// ignore if Tab is not pressed
		if (event.key !== 'Tab' && event.keyCode !== 9) return;

		let focusableElements = getFocusableElements(node);
		let firstFocusableElement = focusableElements[0];
		let lastFocusableElement = focusableElements[focusableElements.length - 1];

		if (event.shiftKey) {
			if (document.activeElement === firstFocusableElement) {
				lastFocusableElement.focus();
				event.preventDefault();
			}
		} else {
			if (document.activeElement === lastFocusableElement) {
				firstFocusableElement.focus();
				event.preventDefault();
			}
		}
	}

	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
		},
	};
}
