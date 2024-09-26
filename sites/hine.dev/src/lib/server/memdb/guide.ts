import type { Frontmatter } from '$collections/guide/index.js';
import {
	createSearchIndex,
	createTable,
	json,
	search,
	string,
} from '@content-thing/memdb';
import { mdastToString } from 'content-thing';

const modules = import.meta.glob<Frontmatter>('$routes/**/guide/**/data.js', {
	import: 'data',
	eager: true,
});
const data = Object.values(modules);
export const guideTable = createTable(
	{
		title: string('title'),
		group: string('group'),
		_id: string('_id'),
		_headingTree: json<'_headingTree', Frontmatter['_headingTree']>(
			'_headingTree',
		),
		_content: json<'_content', Frontmatter['_content']>('_content'),
	},
	data,
);
const { averageDocumentLength, documentLengths, invertedIndex } =
	createSearchIndex(guideTable, {
		title: (x) => x,
		_content: mdastToString,
	});
export const guideSearch = (query: string) =>
	search(
		guideTable,
		invertedIndex,
		documentLengths,
		averageDocumentLength,
		query,
	);
