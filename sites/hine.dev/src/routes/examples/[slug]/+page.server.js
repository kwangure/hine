import { collections } from 'thing:data';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;
	const data = await collections.query.examples.findFirst({
		where: (examples, { eq }) => eq(examples._id, slug),
	});
	if (!data) {
		throw error(404, 'Page not found.');
	}

	const groups = groupItemToEntry(
		await collections.query.groups.findMany({
			with: {
				docs: {
					columns: {
						title: true,
						_id: true,
						_headingTree: true,
					},
					orderBy: (docs, { asc }) => [asc(docs.position)],
				},
				examples: {
					columns: {
						title: true,
						_id: true,
						_headingTree: true,
					},
					orderBy: (examples, { asc }) => [asc(examples.position)],
				},
			},
			orderBy: (groups, { asc }) => [asc(groups.position)],
		}),
		['docs', 'examples'],
	);

	return { groups, content: data._content };
}

/**
 * Merges items in a group into entries.
 *
 * @template {Record<string, any>} T The type of the group object.
 * @template {keyof T} K The keys to be moved into entries.
 *
 * @param {T[]} groups - The original groups array.
 * @param {K[]} collections - The keys to be moved into entries.
 * @returns {import('../../types.js').Simplify<Omit<T, K> & {
 *     entries: import('../../types.js').Simplify<T[K][number] & { collection: K }>[]
 * }>[]} - The modified groups array.
 */
function groupItemToEntry(groups, collections) {
	return groups.map((group) => {
		const entries = /** @type {T[K]} */ ([]);
		const newGroup = { ...group, entries };

		for (const collection of collections) {
			if (Array.isArray(newGroup[collection])) {
				for (const item of /** @type {any[]} */ (newGroup[collection])) {
					item.collection = collection;
					entries.push(item);
				}
				delete newGroup[collection];
			}
		}

		return newGroup;
	});
}
