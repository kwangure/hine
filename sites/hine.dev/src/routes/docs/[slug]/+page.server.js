export async function load({ params }) {
	const { slug } = params;
	const content = /** @type {import('mdast').Root} */ (
		(await import(`../../../docs/content/${slug}/readme.md`)).default
	);

	return { content };
}
