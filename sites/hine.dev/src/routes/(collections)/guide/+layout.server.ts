import { groupsTable } from '$collections/groups.js';
import { guideTable } from '$collections/guide.js';
import { parseRouteId } from '$lib/server/parseRouteId.js';
import { execute, query } from '@content-thing/memdb';
import { error } from '@sveltejs/kit';

// Because of TypeScript `isolatedModules`
export type * from 'content-thing';

export function load({ url }) {
	const parsed = parseRouteId(url);
	if (!parsed) {
		error(404, 'Page not found. URL a:' + url.toString());
	}

	const { slug } = parsed;
	const [entry] = execute(
		query(guideTable)
			.select('title', '_headingTree')
			.where((guide) => guide._id === slug)
			.limit(1),
	);
	if (!entry) error(404, 'Page not found. Slug:' + slug);

	const groups = execute(
		query(groupsTable)
			.select('title', '_id', 'position')
			.with({
				guides(group) {
					return execute(
						query(guideTable)
							.where((guide) => guide.group === group._id)
							.select('title', '_id'),
					);
				},
			}),
	).sort((a, b) => a.position - b.position);

	return { entry, groups };
}
