import { getCollection, getEntry } from 'content-thing:io';

export async function load({ params }) {
	const { slug } = params;
	const content = await getEntry('docs', slug);
	const groups = await groupDocs();

	return { groups, content };
}

async function groupDocs() {
	const [docs, groups] = await Promise.all([
		getCollection('docs'),
		getCollection('groups'),
	]);
	/**
	 * @type {Record<string, {
	 *   data: any,
	 *   entries: any[],
	 * }>}
	 */
	const groupedDocs = {};
	for (const [slug, group] of groups) {
		groupedDocs[slug] = {
			data: group,
			entries: [],
		};
	}

	for (const [name, tree] of docs) {
		const group = tree.data.frontmatter.group;
		if (!group) {
			throw Error(`Docs '${name}' is missing group`);
		}
		if (!Object.hasOwn(groupedDocs, group)) {
			throw Error(`Docs '${name}' has unknown group '${group}'`);
		}
		tree.data.path = `/docs/${name}`;
		groupedDocs[group].entries.push(tree);
	}

	const values = Object.values(groupedDocs);

	for (const group of values) {
		group.entries.sort((a, b) => {
			return a.data.frontmatter.order - b.data.frontmatter.order;
		});
	}

	return values;
}
