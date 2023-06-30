/**
 * @param {any[]} items
 * @param {Object} config
 * @param {string} [config.conjunction]
 * @param {(arg: string) => string} [config.formatItem]
 */
export function formatList(items, config = {}) {
	const itemCount = items.length;

	if (itemCount === 0) return '';

	const { conjunction = ',', formatItem = (x) => x } = config;

	if (itemCount === 1) return formatItem(items[0]);

	const lastItem = formatItem(items[itemCount - 1]);
	const restItems = items.slice(0, -1).map(formatItem);

	return `${restItems.join(', ')} ${conjunction} ${lastItem}`;
}

/**
 * @param {any[]} items
 */
export function formatExpectedList(items) {
	const itemCount = items.length;

	if (itemCount === 0) return '';

	if (itemCount === 1) return `Expected '${items[0]}'.`;

	return `Expect one of: ${formatList(items, {
		conjunction: 'or',
		formatItem: (x) => `'${x}'`,
	})}.`;
}
