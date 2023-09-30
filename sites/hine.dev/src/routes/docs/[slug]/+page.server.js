import { Database } from 'content-thing/better-sqlite3';
// import { error } from '@sveltejs/kit';
// @ts-ignore
import dbPath from './sqlite.db';

const normalizedDBPath = dbPath.replace(/^[a-zA-Z]+:\/\//, '');
console.warn({ dbPath, normalizedDBPath });
const sqlite = new Database(normalizedDBPath);
console.warn({ sqlite });

export async function load() {
	return {
		groups: /** @type {any} */ ([]),
		content: /** @type {any} */ ({ children: [] }),
	};
	// const { slug } = params;
	// const data = await collections.query.docs.findFirst({
	// 	where: (docs, { eq }) => eq(docs._id, slug),
	// });
	// if (!data) {
	// 	throw error(404, 'Page not found.');
	// }

	// const groups = await collections.query.groups.findMany({
	// 	with: {
	// 		docs: {
	// 			columns: {
	// 				title: true,
	// 				_id: true,
	// 				_content: true,
	// 				_headingTree: true,
	// 			},
	// 			orderBy: (docs, { asc }) => [asc(docs.order)],
	// 		},
	// 	},
	// });

	// return { groups, content: data._content };
}
