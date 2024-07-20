import { groups as groupsTable } from 'thing:data/groups.js';
import { guide as guideTable } from 'thing:data/guide.js';
import { execute, query } from '@content-thing/memdb';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const { slug } = params;

	const [entry] = execute(
		query(guideTable)
			.where((guide) => guide._id === slug)
			.limit(1),
	);
	if (!entry) error(404, 'Page not found.');

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
