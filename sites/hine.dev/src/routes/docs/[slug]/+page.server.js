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
	 *   entries: import('./types.js').Document[],
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
		walkTree(tree.data.tableOfContents, (/** @type {any} */ heading) => {
			heading.path = path;
		});
		groupedDocs[group].entries.push({
			title: tree.data.frontmatter.title,
			order: tree.data.frontmatter.order,
			path,
			children: tree.data.tableOfContents,
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
function walkTree(tree, fn) {
	for (let i = 0; i < tree.length; i++) {
		fn(tree[i]);
		walkTree(tree[i].children, fn);
	}
	return tree;
}
