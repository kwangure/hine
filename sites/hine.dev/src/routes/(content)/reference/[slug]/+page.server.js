import { collections } from 'thing:data';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const { slug } = params;

	return {
		groups: collections.query.groups.findMany({
			with: {
				reference: {
					columns: {
						title: true,
						_id: true,
					},
					orderBy: (reference, { asc }) => [asc(reference.title)],
				},
			},
			orderBy: (groups, { asc }) => [asc(groups.position)],
		}),
		entry: collections.query.reference
			.findFirst({
				where: (reference, { eq }) => eq(reference._id, slug),
			})
			.then((data) => {
				if (!data) throw error(404, 'Page not found.');
				return data;
			}),
	};
}
