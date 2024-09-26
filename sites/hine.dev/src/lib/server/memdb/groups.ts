import type { Frontmatter } from '$collections/groups';
import { createTable, number, string } from '@content-thing/memdb';

const modules = import.meta.glob<Frontmatter>('$routes/**/groups/**/data.js', {
	import: 'data',
	eager: true,
});
const data = Object.values(modules);
export const groupsTable = createTable(
	{
		title: string('title'),
		position: number('position'),
		_id: string('_id'),
	},
	data,
);
