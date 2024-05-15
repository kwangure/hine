import { collections } from 'thing:data';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	const [entry, groups] = await Promise.all([
		collections.query.guide
			.findFirst({
				where: (guide, { eq }) => eq(guide._id, slug),
			})
			.then((data) => {
				if (!data) error(404, 'Page not found.');
				return data;
			}),
		collections.query.groups.findMany({
			with: {
				guide: {
					columns: {
						title: true,
						_id: true,
					},
					orderBy: (guide, { asc }) => [asc(guide.title)],
				},
			},
			orderBy: (groups, { asc }) => [asc(groups.position)],
		}),
	]);

	return { entry, groups };
}
