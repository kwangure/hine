import { collections } from 'thing:data';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const { slug } = params;

	return {
		groups: collections.query.groups.findMany({
			with: {
				docs: {
					columns: {
						title: true,
						_id: true,
						_headingTree: true,
					},
					orderBy: (docs, { asc }) => [asc(docs.position)],
				},
			},
			orderBy: (groups, { asc }) => [asc(groups.position)],
		}),
		content: collections.query.docs
			.findFirst({
				where: (docs, { eq }) => eq(docs._id, slug),
			})
			.then((data) => {
				if (!data) throw error(404, 'Page not found.');
				return data._content;
			}),
	};
}
