/* global __ENTRIES__  */
const entries = __ENTRIES__;

/**
 * @param {string} collection
 * @param {string} slug
 */
export async function getEntry(collection, slug) {
	const source = /** @type {keyof entries} */ (`${collection}/${slug}`);
	return /** @type {Promise<import('mdast').Root>} */ (
		/** @type {unknown} */ ((await entries[source]()).default)
	);
}
