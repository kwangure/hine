import { collections } from 'thing:data';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	const [entry, groups] = await Promise.all([
		collections.query.reference
			.findFirst({
				where: (reference, { eq }) => eq(reference._id, slug),
			})
			.then((data) => {
				if (!data) error(404, 'Page not found.');
				return data;
			}),
		collections.query.groups.findMany({
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
	]);

	return { entry, groups };
}
