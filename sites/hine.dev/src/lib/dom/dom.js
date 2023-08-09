// https://github.com/ariakit/ariakit/blob/main/packages/ariakit-core/src/utils/dom.ts

/**
 * @param {Element | null} element
 * @return {HTMLElement | Element | null}
 */
export function getScrollingElement(element) {
	if (!element) return null;
	if (element.clientHeight && element.scrollHeight > element.clientHeight) {
		const { overflowY } = getComputedStyle(element);
		const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
		if (isScrollable) return element;
	} else if (element.clientWidth && element.scrollWidth > element.clientWidth) {
		const { overflowX } = getComputedStyle(element);
		const isScrollable = overflowX !== 'visible' && overflowX !== 'hidden';
		if (isScrollable) return element;
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
