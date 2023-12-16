import { collections } from 'thing:data';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	const [groups, entry] = await Promise.all([
		collections.query.groups.findMany({
			with: {
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
		collections.query.examples
			.findFirst({
				where: (examples, { eq }) => eq(examples._id, slug),
			})
			.then((data) => {
				if (!data) error(404, 'Page not found.');
				return data;
			}),
	]);

	return { entry, groups };
}
