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
	 *   entries: import('./types.js').GroupEntry[],
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
		const path = `/docs/${name}`;
		groupedDocs[group].entries.push({
			depth: 1,
			path,
			children: mapTree(
				tree.data.tableOfContents,
				(/** @type {any} */ heading) => ({
					depth: heading.depth,
					value: heading.value,
					path,
					id: heading.id,
					hash: heading.hash,
					children: heading.children,
				}),
			),
			value: tree.data.frontmatter.title,
			order: tree.data.frontmatter.order,
		});
	}

	const values = Object.values(groupedDocs);

	for (const group of values) {
		group.entries.sort((a, b) => a.order - b.order);
	}

	return values;
}

/**
 * @param {any[]} tree
 * @param {{ (arg0: any): any } } fn
 */
function mapTree(tree, fn) {
	for (let i = 0; i < tree.length; i++) {
		tree[i] = fn(tree[i]);
		mapTree(tree[i].children, fn);
	}
	return tree;
}
