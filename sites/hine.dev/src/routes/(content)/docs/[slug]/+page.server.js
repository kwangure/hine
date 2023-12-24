import { collections } from 'thing:data';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	const [entry, groups] = await Promise.all([
		collections.query.docs
			.findFirst({
				where: (docs, { eq }) => eq(docs._id, slug),
			})
			.then((data) => {
				if (!data) error(404, 'Page not found.');
				return data;
			}),
		collections.query.groups.findMany({
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
	]);

	return { entry, groups };
}
