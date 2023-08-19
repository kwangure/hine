// eslint-disable-next-line no-undef
const collections = __ENTRIES__;

/**
 * @template {keyof collections} T
 * @param {T} collection
 * @param {string} slug
 */
export async function getEntry(collection, slug) {
	const importer =
		collections[collection][
			/** @type {keyof (typeof collections)[T]} */ (slug)
		];
	const module = await importer();
	return /** @type {import('mdast').Root} */ (module.default);
}

/**
 * @param {keyof collections} name
 */
export async function getCollection(name) {
	const collection = collections[name];
	const promises = [];
	for (const [id, importer] of Object.entries(collection)) {
		const promise = (async () => {
			const module = await importer();
			return /** @type {[string, any]} */ ([id, module.default]);
		})();
		promises.push(promise);
	}
	const entries = await Promise.all(promises);
	return entries;
}
