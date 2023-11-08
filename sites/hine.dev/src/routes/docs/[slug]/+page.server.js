import { collections } from 'thing:data';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;
	const data = await collections.query.docs.findFirst({
		where: (docs, { eq }) => eq(docs._id, slug),
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
						_content: true,
						_headingTree: true,
					},
					orderBy: (docs, { asc }) => [asc(docs.position)],
				},
			},
			orderBy: (groups, { asc }) => [asc(groups.position)],
		}),
		['docs'],
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
 * @param {K[]} items - The keys to be moved into entries.
 * @returns {import('./types.js').Simplify<Omit<T, K> & { entries: T[K] }>[]} - The modified groups array.
 */
function groupItemToEntry(groups, items) {
	return groups.map((group) => {
		const entries = /** @type {T[K]} */ ([]);
		const newGroup = { ...group, entries };

		for (const item of items) {
			if (Array.isArray(newGroup[item])) {
				entries.push(.../** @type {any[]} */ (newGroup[item]));
				delete newGroup[item];
			}
		}

		return newGroup;
	});
}
