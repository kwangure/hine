import { db } from 'thing:db';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;
	const data = await db.query.docs.findFirst({
		where: (docs, { eq }) => eq(docs.id, slug),
	});
	if (!data) {
		throw error(404, 'Page not found.');
	}

	const groups = await db.query.groups.findMany({
		with: {
			docs: {
				columns: {
					id: true,
					data_title: true,
					content: true,
				},
				orderBy: (docs, { asc }) => [asc(docs.data_order)],
			},
		},
	});

	return { groups, content: data.content };
}
