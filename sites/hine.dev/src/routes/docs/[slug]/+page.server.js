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

	const groups = await collections.query.groups.findMany({
		with: {
			docs: {
				columns: {
					title: true,
					_id: true,
					_content: true,
					_headingTree: true,
				},
				orderBy: (docs, { asc }) => [asc(docs.order)],
			},
		},
	});

	return { groups, content: data._content };
}
