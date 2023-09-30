import { Database } from 'content-thing/better-sqlite3';
import { drizzle } from 'content-thing/drizzle-orm/better-sqlite3';
import * as docs from '../../../../.svelte-kit/content-thing/generated/collections/docs/schema.config.js';
import * as groups from '../../../../.svelte-kit/content-thing/generated/collections/groups/schema.config.js';
// import { error } from '@sveltejs/kit';
// @ts-ignore
import dbPath from './sqlite.db';

const normalizedDBPath = dbPath.replace(/^[a-zA-Z]+:\/\//, '');
console.warn({ dbPath, normalizedDBPath });
console.error({ url: import.meta.url });
const sqlite = new Database(normalizedDBPath);
console.warn({ sqlite });
const collections = drizzle(sqlite, { schema: { ...docs, ...groups } });

export async function load({ params }) {
	const { slug } = params;
	const statement = sqlite.prepare('SELECT * from docs');
	console.log({ statement });
	const data = await collections.query.docs.findFirst({
		where: (docs, { eq }) => eq(docs._id, slug),
	});
	console.log({ data });
	return {
		groups: /** @type {any} */ ([]),
		content: /** @type {any} */ ({ children: [] }),
	};
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
