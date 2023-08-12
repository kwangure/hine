const FOCUSABLE_SELECTOR = [
	'a[href]',
	'area[href]',
	'input:not([type="hidden"])',
	'select',
	'textarea',
	'button',
	'iframe',
	'object',
	'embed',
	'[contenteditable]',
	'[tabindex]',
].join(',');

/**
 * @param {HTMLElement} element
 */
export function getFocusableElements(element) {
	const selectedElements = /** @type {HTMLElement[]} */ (
		Array.from(element.querySelectorAll(FOCUSABLE_SELECTOR))
	);

	return selectedElements.filter((element) => {
		const tabIndex = element.getAttribute('tabindex');
		// @ts-expect-error
		if (element.disabled || (tabIndex !== null && Number(tabIndex) < 0)) {
			return false;
		}

		// Check computed style last since it's more expensive
		const style = getComputedStyle(element);
		const isHidden = style.display === 'none' || style.visibility === 'hidden';
		return !isHidden;
	});
}

// https://github.com/ariakit/ariakit/blob/main/packages/ariakit-core/src/utils/dom.ts

/**
 * @param {Element} element
 */
export function isScrollableY(element) {
	if (!element.clientHeight || element.scrollHeight <= element.clientHeight) {
		return false;
	}
	const { overflowY } = getComputedStyle(element);
	return overflowY !== 'visible' && overflowY !== 'hidden';
}

/**
 * @param {Element} element
 */
export function isScrollableX(element) {
	if (!element.clientWidth || element.scrollWidth <= element.clientWidth) {
		return false;
	}
	const { overflowX } = getComputedStyle(element);
	return overflowX !== 'visible' && overflowX !== 'hidden';
}

/**
 * @param {Element | null} element
 * @return {HTMLElement | Element | null}
 */
export function getScrollingElement(element) {
	if (!element) return null;
	if (isScrollableY(element) || isScrollableX(element)) {
		return element;
	}
	return (
		getScrollingElement(element.parentElement) ||
		document.scrollingElement ||
		document.body
	);
}

/**
 * Determines whether an element is hidden or partially hidden in the viewport.
 * @param {HTMLElement} element
 */
export function isPartiallyHidden(element) {
	const elementRect = element.getBoundingClientRect();
	const scroller = getScrollingElement(element);
	if (!scroller) return false;
	const scrollerRect = scroller.getBoundingClientRect();

	const isHTML = scroller.tagName === 'HTML';
	const scrollerTop = isHTML
		? scrollerRect.top + scroller.scrollTop
		: scrollerRect.top;
	const scrollerBottom = isHTML ? scroller.clientHeight : scrollerRect.bottom;
	const scrollerLeft = isHTML
		? scrollerRect.left + scroller.scrollLeft
		: scrollerRect.left;
	const scrollerRight = isHTML ? scroller.clientWidth : scrollerRect.right;

	const top = elementRect.top < scrollerTop;
	const left = elementRect.left < scrollerLeft;
	const bottom = elementRect.bottom > scrollerBottom;
	const right = elementRect.right > scrollerRight;

	return top || left || bottom || right;
}
