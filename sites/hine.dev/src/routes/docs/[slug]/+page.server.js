import { getEntry } from 'content-thing:io';

export async function load({ params }) {
	const { slug } = params;
	const content = await getEntry('docs', slug);

	return { content };
}
